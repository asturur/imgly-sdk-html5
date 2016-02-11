/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { ReactBEM, Vector2, Constants } from '../../../../globals'
import DraggableComponent from '../../../draggable-component.jsx'
import CanvasControlsComponent from '../../canvas-controls-component'

export default class RadialBlurCanvasControlsComponent extends CanvasControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onCenterDragStart',
      '_onCenterDrag',
      '_onKnobDragStart',
      '_onKnobDrag'
    )

    this.state = {
      areaPosition: new Vector2(),
      areaDimensions: new Vector2(),
      knobPosition: new Vector2()
    }
    this._knobChangedManually = false
    this._operation = this.getSharedState('operation')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called after the canvas has been zoomed in or out
   * @private
   */
  _onCanvasZoomDone () {
    this._setStylesFromOptions()
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when the shared state did change
   * @param {Object} newState
   */
  sharedStateDidChange (newState) {
    if (newState.operation) {
      this._operation = newState.operation
    }
    this._setStylesFromOptions()
  }

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()
    const { editor } = this.context
    editor.setZoom('auto', () => {
      editor.disableFeatures('zoom', 'drag')
      this._setStylesFromOptions()
    })
  }

  // -------------------------------------------------------------------------- CENTER DRAGGING

  /**
   * Gets called when the user stars dragging the center
   * @private
   */
  _onCenterDragStart () {
    this._initialPosition = this._operation.getPosition()
    this._initialKnobPosition = this.state.knobPosition.clone()
  }

  /**
   * Gets called while the user drags the center
   * @param {Vector2} offset
   * @private
   */
  _onCenterDrag (offset) {
    const { editor } = this.context
    const relativeOffset = offset.clone().divide(editor.getOutputDimensions())

    const newPosition = this._initialPosition
      .clone()
      .add(relativeOffset)

    const newKnobPosition = this._initialKnobPosition.clone()
      .add(offset)

    this._operation.set({
      position: newPosition
    })

    this.state.knobPosition = newKnobPosition

    editor.render()
    this._setStylesFromOptions()
  }

  // -------------------------------------------------------------------------- GRADIENT KNOB DRAG

  /**
   * Gets called when the user stars dragging the gradient knob
   * @private
   */
  _onKnobDragStart (e) {
    this._knobChangedManually = true
    this._initialKnobPosition = this.state.knobPosition.clone()
  }

  /**
   * Gets called while the user drags the gradient knob
   * @param {Vector2} offset
   * @private
   */
  _onKnobDrag (offset) {
    const { editor } = this.context
    const zoom = editor.getZoom()
    const outputDimensions = editor.getOutputDimensions()

    const newKnobPosition = this._initialKnobPosition.clone()
      .add(offset)
      .clamp(new Vector2(0, 0), outputDimensions)

    const absolutePosition = this._operation.getPosition()
      .clone()
      .multiply(outputDimensions)

    const newGradientRadius = newKnobPosition
      .clone()
      .subtract(absolutePosition)
      .abs()
      .len()

    this.setState({
      knobPosition: newKnobPosition,
      areaDimensions: new Vector2(
        newGradientRadius * 2,
        newGradientRadius * 2
      )
    })
    this._operation.setGradientRadius(newGradientRadius / zoom)

    editor.render()
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the CSS styles for the area div
   * @return {Object}
   * @private
   */
  _getAreaStyle () {
    return {
      width: this.state.areaDimensions.x,
      height: this.state.areaDimensions.y,
      left: this.state.areaPosition.x,
      top: this.state.areaPosition.y,
      marginLeft: this.state.areaDimensions.x * -0.5,
      marginTop: this.state.areaDimensions.y * -0.5
    }
  }

  /**
   * Returns the CSS styles for the knob
   * @return {Object}
   * @private
   */
  _getKnobStyle () {
    return {
      left: this.state.knobPosition.x,
      top: this.state.knobPosition.y
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Sets the dimensions and position values from the current operation options
   * @private
   */
  _setStylesFromOptions () {
    const { editor } = this.context
    const zoom = editor.getZoom()

    const outputDimensions = this.context.editor.getOutputDimensions()

    const position = this._operation.getPosition()
      .clone()
      .multiply(outputDimensions)

    const gradientRadius = this._operation.getGradientRadius()

    const areaSize = new Vector2(
      gradientRadius * 2 * zoom,
      gradientRadius * 2 * zoom
    )

    let newState = {
      areaDimensions: areaSize,
      areaPosition: position
    }

    if (!this._knobChangedManually) {
      newState.knobPosition = position.clone()
        .add(gradientRadius * zoom, 0)
    }

    this.setState(newState)
  }

  /**
   * Returns the container style
   * @return {Object}
   * @private
   */
  _getContainerStyle () {
    const { editor } = this.context
    const { x, y, width, height } = editor.getLastOutputBounds()
    return {
      left: x,
      top: y,
      width, height
    }
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='b:canvasControls e:container m:full' ref='container' style={this._getContainerStyle()}>
      <div bem='$b:radialBlurCanvasControls'>
        <DraggableComponent
          onStart={this._onCenterDragStart}
          onDrag={this._onCenterDrag}>
          <div bem='e:area' style={this._getAreaStyle()} />
        </DraggableComponent>
        <DraggableComponent
          onStart={this._onKnobDragStart}
          onDrag={this._onKnobDrag}>
          <div bem='e:knob $b:knob' style={this._getKnobStyle()}></div>
        </DraggableComponent>
      </div>
    </div>)
  }
}
