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

import { ReactBEM, Constants } from '../../../globals'
import ControlsComponent from '../controls-component'
import SliderComponent from '../../slider-component'
import ColorPickerComponent from '../../color-picker/color-picker-component'

export default class TiltShiftControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._hasDoneButton = true
    this._operation = this.getSharedState('operation')

    this._bindAll(
      '_onThicknessUpdated',
      '_onColorUpdated',
      '_onOperationUpdated'
    )

    this.state = {
      thicknessControlsEnabled: false
    }

    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()
    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto', () => {
      this._emitEvent(Constants.EVENTS.EDITOR_DISABLE_FEATURES, ['zoom', 'drag'])
    })
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an operation has been updated
   * @param  {Operation} operation
   * @private
   */
  _onOperationUpdated (operation) {
    if (operation === this._operation) {
      this.forceUpdate()
    }
  }

  /**
   * Gets called when the thickness has been updated
   * @param {Number} thickness
   * @private
   */
  _onThicknessUpdated (thickness) {
    this._operation.setThickness(thickness)
  }

  /**
   * Gets called when the color has been updated
   * @param  {Color} color
   * @private
   */
  _onColorUpdated (color) {
    this._operation.setColor(color)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const { editor } = this.context
    const finalDimensions = editor.getFinalDimensions()

    const minThickness = 0
    const maxThickness = Math.round(Math.min(finalDimensions.x, finalDimensions.y) / 2)
    const currentWidth = this._operation.getThickness()

    return [(<div bem='e:cell m:slider'>
      <SliderComponent
        style='large'
        minValue={minThickness}
        maxValue={maxThickness}
        valueUnit='px'
        middleDot={false}
        label={this._t('controls.brush.thickness')}
        onChange={this._onThicknessUpdated}
        value={currentWidth} />
    </div>),
    (<div bem='e:cell m:colorPicker'>
      <ColorPickerComponent
        initialValue={this._operation.getColor().clone()}
        onChange={this._onColorUpdated} />
    </div>)]
  }
}
