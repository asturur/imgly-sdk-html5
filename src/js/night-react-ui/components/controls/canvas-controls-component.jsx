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
      '_onCanvasZoomDone'
    )
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called after the canvas has been zoomed in or out
   * @private
   */
  _onCanvasZoomDone () {
    this.forceUpdate()
  }

  /**
   * Binds the events in _events
   * @protected
   */
  _bindEvents () {
    super._bindEvents()
    this.context.mediator.on(
      Constants.EVENTS.ZOOM_DONE,
      this._onCanvasZoomDone
    )
  }

  /**
   * Unbinds the events in _events
   * @protected
   */
  _unbindEvents () {
    super._unbindEvents()
    this.context.mediator.off(
      Constants.EVENTS.ZOOM_DONE,
      this._onCanvasZoomDone
    )
  }
}
