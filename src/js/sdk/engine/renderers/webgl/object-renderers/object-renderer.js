/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * The base class for all ObjectRenderer classes
 * @class
 * @memberof PhotoEditorSDK.Engine
 */
class ObjectRenderer {
  /**
   * Creates an ObjectRenderer
   * @param  {BaseRenderer} renderer
   */
  constructor (renderer) {
    this._renderer = renderer

    this._onContextChange = this._onContextChange.bind(this)
    this._renderer.on('context', this._onContextChange)
  }

  /**
   * Gets called when the rendering context changes
   * @private
   */
  _onContextChange () {

  }

  /**
   * Gets called when this object renderer is activated
   */
  start () {

  }

  /**
   * Gets called when this object renderer is deactivated
   */
  stop () {
    this.flush()
  }

  /**
   * Renders whatever has been queued
   */
  flush () {

  }

  /**
   * Disposes this ObjectRenderer
   */
  dispose () {
    this._renderer.off('context', this._onContextChange)
    this._renderer = null
  }
}

export default ObjectRenderer
