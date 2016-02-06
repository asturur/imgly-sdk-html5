/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { BaseComponent, Constants } from '../../globals'

export default class CanvasControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onWindowResize'
    )
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the window has been resized
   * @private
   */
  _onWindowResize () {
    this.forceUpdate()
  }

  /**
   * Binds the events in _events
   * @protected
   */
  _bindEvents () {
    super._bindEvents()
    this.context.mediator.on(
      Constants.EVENTS.WINDOW_RESIZE,
      this._onWindowResize
    )
  }

  /**
   * Unbinds the events in _events
   * @protected
   */
  _unbindEvents () {
    super._unbindEvents()
    this.context.mediator.off(
      Constants.EVENTS.WINDOW_RESIZE,
      this._onWindowResize
    )
  }
}
