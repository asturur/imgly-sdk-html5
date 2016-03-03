/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2 } from '../globals'

/**
 * A canvas render target that you can render to.
 * Canvas equivalent of {@link PhotoEditorSDK.Engine.RenderTarget}
 * @class
 * @memberof PhotoEditorSDK.Engine
 */
class CanvasBuffer {
  /**
   * Creates a CanvasBuffer
   * @param  {Number} width
   * @param  {Number} height
   * @param  {Number} pixelRatio
   * @param  {HTMLCanvasElement} canvas
   * @param  {CanvasRenderingContext2D} context
   */
  constructor (width, height, pixelRatio, canvas, context) {
    this._width = width
    this._height = height
    this._pixelRatio = pixelRatio

    this._canvas = canvas || this._createCanvas()
    this._context = context || this._canvas.getContext('2d')

    this._canvas.width = this._width * this._pixelRatio
    this._canvas.height = this._height * this._pixelRatio
    this._filterStack = [
      {
        renderTarget: this,
        filter: []
      }
    ]
  }

  /**
   * Creates a canvas
   * @return {Canvas}
   * @private
   */
  _createCanvas () {
    if (typeof document !== 'undefined') {
      return document.createElement('canvas')
    } else {
      return new (require('canvas'))()
    }
  }

  /**
   * Clears this CanvasBuffer
   */
  clear () {
    const ctx = this._context
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this._width * this._pixelRatio, this._height * this._pixelRatio)
  }

  /**
   * Resizes this canvas buffer to the given dimensions
   * @param  {PhotoEditorSDK.Math.Vector2} dimensions
   */
  resizeTo (dimensions) {
    if (this._width !== dimensions.x) {
      this._width = dimensions.x
      this._canvas.width = this._width * this._pixelRatio
    }

    if (this._height !== dimensions.y) {
      this._height = dimensions.y
      this._canvas.height = this._height * this._pixelRatio
    }
  }

  /**
   * Returns the canvas
   * @return {HTMLCanvasElement}
   */
  getCanvas () { return this._canvas }

  /**
   * Returns the rendering context
   * @return {CanvasRenderingContext2D} [description]
   */
  getContext () { return this._context }

  /**
   * Returns the filter stack
   * @return {Object[]}
   */
  getFilterStack () { return this._filterStack }

  /**
   * Returns the width
   * @return {Number}
   */
  getWidth () { return this._width }

  /**
   * Returns the height
   * @return {Number}
   */
  getHeight () { return this._height }

  /**
   * Returns the pixel ratio
   * @return {Number}
   */
  getPixelRatio () { return this._pixelRatio }

  /**
   * Sets the pixel ratio
   * @param {Number} pixelRatio
   */
  setPixelRatio (pixelRatio) { this._pixelRatio = pixelRatio }

  /**
   * Returns the dimensions
   * @return {PhotoEditorSDK.Math.Vector2}
   */
  getDimensions () { return new Vector2(this._width, this._height) }

  /**
   * Cleans up this canvas buffer
   */
  dispose () {
    this._canvas = null
    this._context = null
  }
}

export default CanvasBuffer
