/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Color, Vector2, Matrix, Rectangle } from '../globals'

/**
 * An object that you can render to. WebGL equivalent of {@link PhotoEditorSDK.Engine.CanvasBuffer}
 * @class
 * @memberof PhotoEditorSDK.Engine
 */
class RenderTarget {
  /**
   * Creates a RenderTarget
   * @param  {PhotoEditorSDK.Engine.BaseRenderer}  renderer
   * @param  {Number}  width
   * @param  {Number}  height
   * @param  {Number}  pixelRatio
   * @param  {Boolean} [isRoot = false]
   */
  constructor (renderer, width, height, pixelRatio, isRoot = false) {
    this._renderer = renderer
    this._gl = renderer.getContext()
    this._width = width
    this._height = height
    this._frame = null
    this._pixelRatio = pixelRatio
    this._projectionMatrix = new Matrix()

    // `null` means render to canvas directly
    this._framebuffer = null
    this._isRoot = isRoot
    this._filterStack = [
      {
        renderTarget: this,
        filter: []
      }
    ]

    if (!isRoot) {
      this._initFrameBuffer()
    }
  }

  /**
   * Resizes this RenderTarget to the given dimensions
   * @param  {PhotoEditorSDK.Math.Vector2} dimensions
   */
  resizeTo (dimensions) {
    this._width = dimensions.x | 0 // rounded
    this._height = dimensions.y | 0 // rounded

    if (!this._isRoot) {
      this._resizeTexture(dimensions)
    }

    this._calculateProjectionMatrix()
  }

  /**
   * Resizes the FBO's texture to the given dimensions
   * @param  {PhotoEditorSDK.Math.Vector2} dimensions
   * @private
   */
  _resizeTexture (dimensions) {
    const gl = this._gl
    gl.bindTexture(gl.TEXTURE_2D, this._texture)

    const realWidth = this._width * this._pixelRatio
    const realHeight = this._height * this._pixelRatio
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
      realWidth, realHeight,
      0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  }

  /**
   * Binds the framebuffer and resizes the viewport
   */
  activate () {
    const gl = this._gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)

    this._calculateProjectionMatrix()

    gl.viewport(0,
      0,
      this._width * this._pixelRatio,
      this._height * this._pixelRatio)
    gl.disable(gl.STENCIL_TEST)
  }

  /**
   * Clears the framebuffer
   */
  clear (color = Color.TRANSPARENT) {
    const gl = this._gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)

    gl.clearColor(color.r, color.g, color.b, color.a)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  /**
   * Calculates the projection matrix for this render target
   * @private
   */
  _calculateProjectionMatrix () {
    const projectionMatrix = this._projectionMatrix
    projectionMatrix.reset()

    const frame = this._frame || new Rectangle(0, 0, this._width, this._height)

    const { x, y } = frame
    if (!this._isRoot) {
      projectionMatrix.a = 1 / this._width * 2
      projectionMatrix.d = 1 / this._height * 2

      projectionMatrix.tx = -1 - x * projectionMatrix.a
      projectionMatrix.ty = -1 - y * projectionMatrix.d
    } else {
      projectionMatrix.a = 1 / this._width * 2
      projectionMatrix.d = -1 / this._height * 2

      projectionMatrix.tx = -1 - x * projectionMatrix.a
      projectionMatrix.ty = 1 - y * projectionMatrix.d
    }
  }

  /**
   * Initializes the WebGL FBO and Texture for this RenderTarget
   * @private
   */
  _initFrameBuffer () {
    const gl = this._gl

    // Init the FBO
    this._framebuffer = gl.createFramebuffer()

    // Create the texture
    this._texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this._texture)

    // Set scale and repeat parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    // Bind texture to FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0)

    this.resizeTo(new Vector2(this._width, this._height))
  }

  /**
   * Returns the projection matrix
   * @return {PhotoEditorSDK.Math.Matrix}
   */
  getProjectionMatrix () { return this._projectionMatrix }

  /**
   * Returns the texture
   * @return {PhotoEditorSDK.Engine.Texture}
   */
  getTexture () { return this._texture }

  /**
   * Returns the frame
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  getFrame () { return this._frame }

  /**
   * Sets the frame
   * @param {PhotoEditorSDK.Math.Rectangle} frame
   */
  setFrame (frame) { this._frame = frame }

  /**
   * Returns the filter stack
   * @return {Object[]}
   */
  getFilterStack () { return this._filterStack }

  /**
   * Disposes this RenderTarget
   */
  dispose () {
    const gl = this._gl
    gl.deleteTexture(this._texture)
    gl.deleteFramebuffer(this._framebuffer)
  }
}

export default RenderTarget
