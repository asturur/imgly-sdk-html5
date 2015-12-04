/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class ObjectRenderer {
  constructor (renderer) {
    this._renderer = renderer
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
}
