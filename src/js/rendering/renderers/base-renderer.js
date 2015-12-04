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

import Utils from '../utils/utils'

const { EventEmitter } = PhotoEditorSDK

export default class BaseRenderer extends EventEmitter {
  constructor (width, height, options) {
    super()

    this._width = width || 800
    this._height = height || 600

    this._canvas = options.canvas || document.createElement('canvas')

    this._options = Utils.defaults(options, {
      resolution: 1
    })

    this._context = this._createContext()
    this._setupContext()
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
}
