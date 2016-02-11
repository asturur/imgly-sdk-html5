/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class CanvasBuffer {
  constructor (width, height, pixelRatio) {
    this._width = width
    this._height = height
    this._pixelRatio = pixelRatio

    this._canvas = document.createElement('canvas')
    this._context = this._canvas.getContext('2d')

    this._canvas.width = this._width
    this._canvas.height = this._height
  }

  /**
   * Clears this CanvasBuffer
   */
  clear () {
    const ctx = this._context
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this._width, this._height)
  }

  /**
   * Resizes this canvas buffer to the given dimensions
   * @param  {Vector2} dimensions
   */
  resizeTo (dimensions) {
    this._width = dimensions.x
    this._canvas.width = this._width
    this._height = dimensions.y
    this._canvas.height = this._height
  }

  /**
   * Cleans up this canvas buffer
   */
  dispose () {
    this._canvas = null
    this._context = null
  }

  getCanvas () { return this._canvas }
  getContext () { return this._context }
}
