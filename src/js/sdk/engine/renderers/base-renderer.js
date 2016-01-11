/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2, EventEmitter, Color } from '../globals'
import Utils from '../utils/utils'

export default class BaseRenderer extends EventEmitter {
  constructor (width, height, options) {
    super()

    this._width = width || 800
    this._height = height || 600
    this._dimensions = new Vector2(this._width, this._height)

    this._canvas = options.canvas || document.createElement('canvas')

    this._options = Utils.defaults(options, {
      pixelRatio: 1,
      clearColor: Color.TRANSPARENT
    })

    this._context = this._createContext()
    this._onBeforeContext()
    this._setupContext()
  }

  /**
   * Gets called before the context has been set up
   * @private
   */
  _onBeforeContext () {

  }

  /**
   * Resizes the context and view to the given size
   * @param  {Vector2} dimensions
   */
  resizeTo (dimensions) {
    const { pixelRatio } = this._options
    this._width = dimensions.x * pixelRatio
    this._height = dimensions.y * pixelRatio

    this._canvas.width = this._width
    this._canvas.height = this._height

    if (this._canvas.style) {
      this._canvas.style.width = `${this._width / pixelRatio}px`
      this._canvas.style.height = `${this._height / pixelRatio}px`
    }

    this._dimensions = dimensions.clone()
  }

  /**
   * Gets the rendering context for this renderer
   * @returns {Object}
   * @private
   * @abstract
   */
  _createContext () {
    return null
  }

  /**
   * Sets up the rendering context for this renderer
   * @private
   * @abstract
   */
  _setupContext () {

  }

  /**
   * Renders the given displayObject
   * @param  {DisplayObject} displayObject
   */
  render (displayObject) {

  }

  getContext () { return this._context }
  getWidth () { return this._dimensions.x }
  getHeight () { return this._dimensions.y }
  getPixelRatio () { return this._options.pixelRatio }
}
