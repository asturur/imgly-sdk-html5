/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Log, Vector2, EventEmitter, Color } from '../globals'
import Utils from '../utils/utils'

/**
 * The base class for all renderers
 * @class
 * @memberof PhotoEditorSDK.Engine
 */
class BaseRenderer extends EventEmitter {
  /**
   * Create a BaseRenderer instance
   * @param  {Number} width
   * @param  {Number} height
   * @param  {Object} options = {}
   * @param  {Number} [options.pixelRatio = 1]
   * @param  {PhotoEditorSDK.Color} [options.clearColor = PhotoEditorSDK.Color.TRANSPARENT]
   * @param  {Boolean} [options.debug = false]
   */
  constructor (width, height, options = {}) {
    super()

    this._options = Utils.defaults(options, {
      pixelRatio: 1,
      clearColor: Color.TRANSPARENT,
      debug: false
    })

    this.setMaxListeners(25)
    this._width = width || 800
    this._height = height || 600
    this._dimensions = new Vector2(this._width, this._height)
    this._maxTextureSize = null
    this._pixelRatio = this._options.pixelRatio
  }

  /**
   * Sets the canvas to the given one
   * @param {HTMLCanvasElement} canvas
   */
  setCanvas (canvas) {
    this._canvas = canvas

    this._createContext()
    this._onBeforeContext()
    this._setupContext()

    this.resizeTo(new Vector2(this._width, this._height))
  }

  /**
   * Returns the current canvas
   * @return {HTMLCanvasElement}
   */
  getCanvas () {
    return this._canvas
  }

  /**
   * Gets called before the context has been set up
   * @protected
   */
  _onBeforeContext () {

  }

  /**
   * Resizes the context and view to the given size
   * @param  {PhotoEditorSDK.Math.Vector2} dimensions
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
   * @protected
   * @abstract
   */
  _createContext () {
    Log.warn(this.constructor.name, '`_createContext` is abstract and not implemented in inherited class')
  }

  /**
   * Sets up the rendering context for this renderer
   * @protected
   * @abstract
   */
  _setupContext () {
    Log.warn(this.constructor.name, '`_setupContext` is abstract and not implemented in inherited class')
  }

  /**
   * Renders the given displayObject
   * @param  {PhotoEditorSDK.Engine.DisplayObject} displayObject
   * @abstract
   */
  render (displayObject) {
    Log.warn(this.constructor.name, '`render` is abstract and not implemented in inherited class')
  }

  /**
   * Returns the maximum dimensions
   * @return {Number}
   */
  getMaxDimensions () {
    return null
  }

  /**
   * Returns the current rendering context
   * @return {RenderingContext}
   */
  getContext () { return this._context }

  /**
   * Returns the current width
   * @return {Number}
   */
  getWidth () { return this._dimensions.x }

  /**
   * Returns the current height
   * @return {Number}
   */
  getHeight () { return this._dimensions.y }

  /**
   * Returns the current dimensions
   * @return {PhotoEditorSDK.Math.Vector2}
   */
  getDimensions () { return this._dimensions }

  /**
   * Returns the current pixel ratio
   * @return {Number}
   */
  getPixelRatio () { return this._pixelRatio }

  /**
   * Sets the pixel ratio
   * @return {Number}
   */
  setPixelRatio (pixelRatio) { this._pixelRatio = pixelRatio }

  /**
   * Returns the maximum texture size
   * @return {Number}
   */
  getMaxTextureSize () { return this._maxTextureSize }

  /**
   * Returns the current filter manager
   * @return {PhotoEditorSDK.Engine.FilterManager}
   */
  getFilterManager () { return this._filterManager }

  /**
   * Sets the filter manager
   * @param {PhotoEditorSDK.Engine.FilterManager} filterManager
   */
  setFilterManager (filterManager) { this._filterManager = filterManager }

  /**
   * Checks if this renderer is supported on the current device and browser
   * @return {Boolean}
   */
  static isSupported () { return true }

  /**
   * Checks if this renderer's type is equal to the given one
   * @param  {String}  type
   * @return {Boolean}
   */
  isOfType (type) {
    return this._type === type
  }

  /**
   * Disposes this Renderer
   * @abstract
   */
  dispose () {
    Log.warn(this.constructor.name, '`dispose` is abstract and not implemented in inherited class')
  }
}

export default BaseRenderer
