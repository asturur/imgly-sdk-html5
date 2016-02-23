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

import { ReactBEM, Utils, Vector2 } from '../../../globals'
import CanvasControlsComponent from '../canvas-controls-component'

export default class OverviewCanvasControlsComponent extends CanvasControlsComponent {
  constructor (...args) {
    super(...args)
    this._bindAll('_onClick')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks somewhere on the canvas
   * @param  {Event} e
   * @private
   */
  _onClick (e) {
    const { container } = this.refs
    const containerRect = container.getBoundingClientRect()
    const containerPosition = new Vector2(
      containerRect.left,
      containerRect.top
    )
    const position = Utils.getEventPosition(e)
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
        // Responds to click, switch to the controls
        return this.props.onSwitchControls(control, clickResponse)
      }
    }
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the container style
   * @return {Object}
   * @private
   */
  _getContainerStyle () {
    const { x, y, width, height } = this.context.editor.getSDK().getSprite().getBounds()
    return {
      left: x,
      top: y,
      width, height
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div
      bem='$b:canvasControls e:container m:full'
      ref='container'
      style={this._getContainerStyle()}
      onMouseDown={this._onClick}
      onTouchStart={this._onClick} />)
  }
}
