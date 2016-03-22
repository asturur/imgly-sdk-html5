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

import { ReactBEM, Vector2 } from '../../../globals'
import DraggableComponent from '../../draggable-component.jsx'
import CanvasControlsComponent from '../canvas-controls-component'

const MIN_DIMENSIONS = new Vector2(50, 50)

export default class CropCanvasControlsComponent extends CanvasControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onCenterDragStart',
      '_onCenterDrag'
    )

    this._operation = this.getSharedState('operation')

    if (this.props.sharedState) {
      this.setSharedState({
        start: new Vector2(0, 0),
        end: new Vector2(1, 1)
      }, false)
    }
  }

  // -------------------------------------------------------------------------- CENTER DRAGGING

  /**
   * Gets called when the user stars dragging the center
   * @private
   */
  _onCenterDragStart () {
    this._initialStart = this.getSharedState('start').clone()
    this._initialEnd = this.getSharedState('end').clone()
    this._initialCropSize = this._initialEnd.clone().subtract(this._initialStart)
  }

  /**
   * Gets called while the user drags the center
   * @param {Vector2} offset
   * @private
   */
  _onCenterDrag (offset) {
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()
    const cropDifference = offset.clone().divide(outputDimensions)

    const minStart = new Vector2(0, 0)
    const maxStart = new Vector2(1, 1)
      .subtract(this._initialCropSize)

    const newStart = this._initialStart.clone()
      .add(cropDifference)
      .clamp(minStart, maxStart)
    const newEnd = newStart.clone()
      .add(this._initialCropSize)

    this.setSharedState({ start: newStart, end: newEnd })
  }

  // -------------------------------------------------------------------------- KNOB DRAGGING

  /**
   * Gets called when the user starts dragging a knob
   * @param {String} optionName
   * @private
   */
  _onKnobDragStart (optionName) {
    this._currentDragOption = optionName

    this._initialValues = {
      start: this.getSharedState('start').clone(),
      end: this.getSharedState('end').clone()
    }
  }

  /**
   * Gets called while the user drags a knob
   * @param {String} optionName
   * @param {Vector2} offset
   * @private
   */
  _onKnobDrag (optionName, offset) {
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()
    const ratio = this._operation._ratio || '*'

    const newSize = this._initialValues.end.clone()
      .subtract(this._initialValues.start)
      .multiply(outputDimensions)

    // Calculate max size and new size
    let maxSize
    if (optionName === 'start') {
      newSize.subtract(offset)
      maxSize = this._initialValues.end.clone()
        .multiply(outputDimensions)
    } else if (optionName === 'end') {
      newSize.add(offset)
      maxSize = new Vector2(1, 1)
        .subtract(this._initialValues.start)
        .multiply(outputDimensions)
    }

    if (newSize.x > maxSize.x) {
      newSize.x = maxSize.x
    } else if (newSize.x < MIN_DIMENSIONS.x) {
      newSize.x = MIN_DIMENSIONS.x
    }
    if (ratio !== '*') {
      newSize.y = newSize.x / ratio
    }
    if (newSize.y > maxSize.y) {
      newSize.y = maxSize.y
    } else if (newSize.y < MIN_DIMENSIONS.y) {
      newSize.y = MIN_DIMENSIONS.y
    }
    if (ratio !== '*') {
      newSize.x = newSize.y * ratio
    }

    if (optionName === 'start') {
      const newStart = this._initialValues.end.clone()
        .subtract(
          newSize
            .clone()
            .divide(outputDimensions)
        )
      this.setSharedState({ start: newStart })
    } else if (optionName === 'end') {
      const newEnd = this._initialValues.start.clone()
        .add(
          newSize
            .clone()
            .divide(outputDimensions)
        )
      this.setSharedState({ end: newEnd })
    }
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Returns the dimensions according to the current crop dimensions
   * @private
   */
  _calculateDimensions () {
    const { editor } = this.context
    const start = this.getSharedState('start')
    const end = this.getSharedState('end')

    return end.clone()
      .subtract(start)
      .multiply(editor.getInputDimensions())
      .round()
  }

  // -------------------------------------------------------------------------- RESIZING / STYLING

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
      width: Math.round(width),
      height: Math.round(height)
    }
  }

  /**
   * Returns the styles (width / height) for the crop areas that define the
   * crop size
   * @return {Object}
   * @private
   */
  _getAreaStyles () {
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    const start = this.getSharedState('start').clone().multiply(outputDimensions).floor()
    const end = this.getSharedState('end').clone().multiply(outputDimensions).ceil()
    const size = end.clone().subtract(start)

    return {
      topLeft: this._getDimensionsStyles(start.x, start.y),
      topCenter: this._getDimensionsStyles(size.x, start.y),
      centerLeft: this._getDimensionsStyles(start.x, size.y),
      center: this._getDimensionsStyles(size.x, size.y)
    }
  }

  /**
   * Returns the dimensions style (width / height) for the given dimensions
   * @param {Number} x
   * @param {Number} y
   * @return {Object}
   * @private
   */
  _getDimensionsStyles (x, y) {
    // Table cells and rows can't have a width / height of 0
    return {
      width: Math.max(1, x),
      height: Math.max(1, y)
    }
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const areaStyles = this._getAreaStyles()
    const dimensions = this._calculateDimensions()

    return (<div bem='b:canvasControls e:container m:full' ref='container' style={this._getContainerStyle()}>
      <div bem='$b:cropCanvasControls'>
        <div bem='e:row'>
          <div bem='e:cell m:dark' style={areaStyles.topLeft}>&nbsp;</div>
          <div bem='e:cell m:dark' style={areaStyles.topCenter}>&nbsp;</div>
          <div bem='e:cell m:dark' />
        </div>
        <div bem='e:row'>
          <div bem='e:cell m:dark' style={areaStyles.centerLeft}>&nbsp;</div>
          <DraggableComponent
            onStart={this._onCenterDragStart}
            onDrag={this._onCenterDrag}>
              <div bem='e:cell m:bordered' style={areaStyles.center}>
                <DraggableComponent
                  onStart={this._onKnobDragStart.bind(this, 'start')}
                  onDrag={this._onKnobDrag.bind(this, 'start')}>
                    <div bem='e:knob m:topLeft $b:knob'>
                      <img bem='e:icon' src={this._getAssetPath('controls/knobs/resize-diagonal-down@2x.png', true)} />
                    </div>
                </DraggableComponent>
                <div bem='e:dimensions'>{dimensions.x} x {dimensions.y}</div>
                <DraggableComponent
                  onStart={this._onKnobDragStart.bind(this, 'end')}
                  onDrag={this._onKnobDrag.bind(this, 'end')}>
                    <div bem='e:knob m:bottomRight $b:knob'>
                      <img bem='e:icon' src={this._getAssetPath('controls/knobs/resize-diagonal-down@2x.png', true)} />
                    </div>
                </DraggableComponent>
              </div>
          </DraggableComponent>
          <div bem='e:cell m:dark'>&nbsp;</div>
        </div>
        <div bem='e:row'>
          <div bem='e:cell m:dark'>&nbsp;</div>
          <div bem='e:cell m:dark'>&nbsp;</div>
          <div bem='e:cell m:dark'>&nbsp;</div>
        </div>
      </div>
    </div>)
  }
}
