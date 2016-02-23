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

import { ReactBEM } from '../../../globals'
import ControlsComponent from '../controls-component'
import SliderComponent from '../../slider-component'
import ColorPickerComponent from '../../color-picker/color-picker-component'

export default class FrameControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._hasDoneButton = true
    this._operation = this.getSharedState('operation')
    this._bindAll(
      '_onThicknessUpdate',
      '_onColorUpdate'
    )
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    const { editor } = this.context
    editor.setZoom('auto', () => {
      editor.disableFeatures('zoom', 'drag')
    })
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the thickness has been updated
   * @param  {Number} thickness
   * @private
   */
  _onThicknessUpdate (thickness) {
    this._operation.setThickness(thickness)

    const { editor } = this.context
    editor.render()
  }

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    super._onBackClick(e)

    const { editor } = this.context
    if (!this.getSharedState('operationExistedBefore')) {
      editor.removeOperation(this._operation)
    } else {
      this._operation.set(this.getSharedState('initialOptions'))
    }

    editor.undoZoom()
    editor.enableFeatures('zoom', 'drag')
    editor.render()
  }

  /**
   * Gets called when the color has changed
   * @param  {Color} color
   * @private
   */
  _onColorUpdate (color) {
    this._operation.setColor(color)

    const { editor } = this.context
    editor.render()
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
        label={this._t('controls.frame.thickness')}
        onChange={this._onThicknessUpdate}
        value={currentWidth} />
    </div>),
    (<div bem='e:cell m:colorPicker'>
      <ColorPickerComponent
        initialValue={this._operation.getColor().clone()}
        onChange={this._onColorUpdate} />
    </div>)]
  }
}
