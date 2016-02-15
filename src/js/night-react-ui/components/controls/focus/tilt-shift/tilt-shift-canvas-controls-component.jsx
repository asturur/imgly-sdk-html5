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

import { ReactBEM, Vector2 } from '../../../../globals'
import DraggableComponent from '../../../draggable-component.jsx'
import CanvasControlsComponent from '../../canvas-controls-component'

export default class TiltShiftCanvasControlsComponent extends CanvasControlsComponent {
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
    this._initialStart = this._operation.getStart()
    this._initialEnd = this._operation.getEnd()
    this._initialDist = this._initialEnd.clone()
      .subtract(this._initialStart)
  }

  /**
   * Gets called while the user drags the center
   * @param {Vector2} offset
   * @private
   */
  _onCenterDrag (offset) {
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()
    const relativeOffset = offset.clone().divide(outputDimensions)

    const newStart = this._initialStart.clone().add(relativeOffset)
      .clamp(
        new Vector2(0, 0),
        new Vector2(1, 1).subtract(this._initialDist)
      )
    const newEnd = newStart.clone().add(this._initialDist)

    this._operation.set({
      start: newStart,
      end: newEnd
    })

    editor.render()
    this._setStylesFromOptions()
    this.forceUpdate()
  }

  // -------------------------------------------------------------------------- GRADIENT KNOB DRAG

  /**
   * Gets called when the user stars dragging the gradient knob
   * @private
   */
  _onKnobDragStart (e) {
    this._initialKnobPosition = this.state.knobPosition.clone()
  }

  /**
   * Gets called while the user drags the gradient knob
   * @param {Vector2} offset
   * @private
   */
  _onKnobDrag (offset) {
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    const newKnobPosition = this._initialKnobPosition.clone()
      .add(offset)
      .clamp(new Vector2(0, 0), outputDimensions)

    const distance = newKnobPosition.clone()
      .subtract(this.state.areaPosition)
    const newGradientRadius = distance.len() * 2

    let start = this.state.areaPosition.clone()
      .add(-distance.y, distance.x)
      .divide(outputDimensions)
    let end = this.state.areaPosition.clone()
      .add(distance.y, -distance.x)
      .divide(outputDimensions)

    this._operation.set({
      gradientRadius: newGradientRadius,
      start, end
    })
    this.setState({
      knobPosition: newKnobPosition,
      areaDimensions: new Vector2(this.state.areaDimensions.x, newGradientRadius)
    })
    editor.render()
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the CSS styles for the area div
   * @return {Object}
   * @private
   */
  _getAreaStyle () {
    const dist = this.state.knobPosition.clone()
      .subtract(this.state.areaPosition)
    let degrees = Math.atan2(dist.x, dist.y) * (180 / Math.PI)
    const transform = `rotate(${(-degrees).toFixed(2)}deg)`

    return {
      width: this.state.areaDimensions.x,
      height: this.state.areaDimensions.y,
      left: this.state.areaPosition.x,
      top: this.state.areaPosition.y,
      marginLeft: this.state.areaDimensions.x * -0.5,
      marginTop: this.state.areaDimensions.y * -0.5,
      transform: transform,
      MozTransform: transform,
      msTransform: transform,
      WebkitTransform: transform
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
    const outputDimensions = editor.getOutputDimensions()

    const start = this._operation.getStart()
      .clone()
      .multiply(outputDimensions)
    const end = this._operation.getEnd()
      .clone()
      .multiply(outputDimensions)
    const gradientRadius = this._operation.getGradientRadius()

    const dist = end.clone().subtract(start)
    const middle = start.clone()
      .add(dist.clone().divide(2))

    const areaSize = new Vector2(
      outputDimensions.len() * 2,
      gradientRadius
    )

    const totalDist = dist.len()
    const factor = dist.clone().divide(totalDist).divide(2)

    this.setState({
      areaDimensions: areaSize,
      areaPosition: middle.clone(),
      knobPosition: middle.clone()
        .add(-gradientRadius * factor.y, gradientRadius * factor.x)
    })
  }

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

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='b:canvasControls e:container m:full' ref='container' style={this._getContainerStyle()}>
      <div bem='$b:tiltShiftCanvasControls'>
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
