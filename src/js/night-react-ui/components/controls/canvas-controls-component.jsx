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

import { Vector2, BaseComponent, Constants } from '../../globals'

export default class CanvasControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onCanvasZoomDone'
    )
  }

  // -------------------------------------------------------------------------- HIT TEST

  /**
   * Checks if any other control reacts to a click at the given position
   * @param  {Vector2} clickPosition
   * @private
   */
  _performHitTest (clickPosition) {
    const { container } = this.refs
    const containerRect = container.getBoundingClientRect()
    const containerPosition = new Vector2(
      containerRect.left,
      containerRect.top
    )

    const position = clickPosition
      .subtract(containerPosition)

    const { editor } = this.context
    const controls = editor.getAvailableControls()

    // Check if any of the controls responds to a click
    // at the given position
    for (let identifier in controls) {
      const control = controls[identifier]
      const clickResponse = control.clickAtPosition &&
        control.clickAtPosition(position, editor)

      if (clickResponse) {
        // Don't re-select an already selected item
        if (clickResponse.selectedSprite === this.getSharedState('selectedSprite')) {
          return true
        }

        // Responds to click, switch to the controls
        this.props.onSwitchControls(control, clickResponse)
        return true
      }
    }

    return false
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
