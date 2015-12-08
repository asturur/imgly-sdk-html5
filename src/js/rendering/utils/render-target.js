/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const { Matrix } = PhotoEditorSDK

export default class RenderTarget {
  constructor (gl, width, height, resolution) {
    this._gl = gl
    this._width = width
    this._height = height
    this._resolution = resolution
    this._projectionMatrix = new Matrix()

    // `null` means render to canvas directly
    this._framebuffer = null
  }

  /**
   * Binds the framebuffer and resizes the viewport
   */
  activate () {
    const gl = this._gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)

    gl.viewport(0,
      0,
      this._width * this._resolution,
      this._height * this._resolution)
  }

  /**
   * Clears the framebuffer
   */
  clear () {
    const gl = this._gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  getProjectionMatrix () { return this._projectionMatrix }
}
