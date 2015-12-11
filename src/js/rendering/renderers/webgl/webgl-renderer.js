/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import BaseRenderer from '../base-renderer'
import RenderTarget from '../../utils/render-target'
import ObjectRenderer from './object-renderers/object-renderer'
import SpriteRenderer from './object-renderers/sprite-renderer'
import TextureShader from '../../shaders/texture-shader'
import DisplayObject from '../../display/display-object'

export default class WebGLRenderer extends BaseRenderer {
  constructor (...args) {
    super(...args)

    this._fakeObject = new DisplayObject()

    this.shaders = this._initShaders()
    this.renderers = this._initRenderers()

    this._currentObjectRenderer = new ObjectRenderer(this)
  }

  /**
   * Sets the given shader to active
   * @param {Shader} shader
   */
  setShader (shader) {
    this._currentShader = shader
    this._context.useProgram(shader.getProgram())
    this._setAttributesForShader(shader)
  }

  /**
   * Uploads the given shader's attributes to the GPU
   * @param {Shader} shader
   */
  _setAttributesForShader (shader) {
    const gl = this._context
    const attributes = shader.getAttributes()
    const attributeLocations = shader.getAttributeLocations()

    attributes.forEach((attributeName) => {
      const attributeLocation = attributeLocations[attributeName]
      gl.enableVertexAttribArray(attributeLocation)
    })
  }

  /**
   * Initializes the default shaders
   * @return {Object.<String,Shader>}
   * @private
   */
  _initShaders () {
    return {
      default: new TextureShader(this)
    }
  }

  /**
   * Initializes the available object renderers
   * @return {Object.<String,ObjectRenderer>}
   * @private
   */
  _initRenderers () {
    return {
      sprite: new SpriteRenderer(this)
    }
  }

  /**
   * Gets the rendering context for this renderer
   * @returns {Object}
   * @private
   */
  _createContext () {
    const canvas = this._canvas
    const gl = canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    this.id = gl.id = WebGLRenderer.contextId++
    gl.renderer = this

    this.emit('context', gl)

    return gl
  }

  /**
   * Sets up the rendering context for this renderer
   * @private
   */
  _setupContext () {
    const gl = this._context

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
    gl.enable(gl.BLEND)

    this._defaultRenderTarget = new RenderTarget(gl,
      this._width,
      this._height,
      this._options.resolution)
    this._setRenderTarget(this._defaultRenderTarget)
  }

  /**
   * Sets the current render target to the passed one and activates
   * it for rendering
   * @param {RenderTarget} renderTarget
   * @private
   */
  _setRenderTarget (renderTarget) {
    this._currentRenderTarget = renderTarget
    this._currentRenderTarget.activate()
  }

  /**
   * Sets the current object renderer to the given one
   * @param {ObjectRenderer} objectRenderer
   */
  setObjectRenderer (objectRenderer) {
    this._currentObjectRenderer.stop()
    this._currentObjectRenderer = objectRenderer
    this._currentObjectRenderer.start()
  }

  /**
   * Renders the given displayObject
   * @param  {DisplayObject} displayObject
   */
  render (displayObject) {
    this._setRenderTarget(this._defaultRenderTarget)
    this._currentRenderTarget.clear()

    // Since the given displayObject is the "root" object
    // right now, we need to give it a dummy / fake object
    // as parent with the default world transform and alpha
    const originalParent = displayObject.getParent()
    displayObject.setParent(this._fakeObject)

    // Update transforms and render this object
    displayObject.updateTransform()
    displayObject.renderWebGL(this)

    // Reset parent
    displayObject.setParent(originalParent)

    this._currentObjectRenderer.flush()
  }

  /**
   * Clears the context
   */
  clear () {
    const gl = this._context

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  /**
   * Returns and/or creates a WebGLTexture for the given Texture object
   * @param  {Texture} texture
   * @return {WebGLTexture}
   */
  getOrCreateGLTexture (texture) {
    const gl = this._context

    // Make sure we have a WebGLTexture for this context
    let glTexture = texture.getGLTextureForId(gl.id)
    if (!glTexture) {
      glTexture = gl.createTexture()
      texture.setGLTextureForId(glTexture, gl.id)
    }

    gl.bindTexture(gl.TEXTURE_2D, glTexture)

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.getSource())

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    return glTexture
  }

  getCurrentRenderTarget () { return this._currentRenderTarget }
}

WebGLRenderer.contextId = 0
