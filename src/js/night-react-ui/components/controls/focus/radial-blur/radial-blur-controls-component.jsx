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

import { ReactBEM, Constants } from '../../../../globals'
import ControlsComponent from '../../controls-component'
import SliderComponent from '../../../slider-component'

export default class RadialBlurControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._hasDoneButton = true
    this._operation = this.getSharedState('operation')
    this._bindAll(
      '_onBackClick',
      '_onDoneClick',
      '_onSliderValueChange',
      '_onOperationRemoved'
    )

    this._events = {
      [Constants.EVENTS.OPERATION_REMOVED]: this._onOperationRemoved
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an operation is removed
   * @return {Operation} operation
   * @private
   */
  _onOperationRemoved (operation) {
    if (operation !== this._operation) return

    // Operation can be removed by the undo button. We need
    // to make sure we re-create the operation for the lifetime
    // of this control
    const { editor } = this.context
    const newOperation = editor.getOrCreateOperation('radial-blur')
    this._operation = newOperation
    this.setSharedState({
      operation: newOperation,
      operationExistedBefore: false,
      initialOptions: {}
    })
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

    editor.render()
    editor.undoZoom()
    editor.enableFeatures('zoom', 'drag')
  }

  /**
   * Gets called when the user clicks the done button
   * @param  {Event} e
   * @private
   */
  _onDoneClick (e) {
    const { editor } = this.context
    const operationExistedBefore = this.getSharedState('operationExistedBefore')
    const initialOptions = this.getSharedState('initialOptions')
    const optionsChanged = !this._operation.optionsEqual(initialOptions)

    if (optionsChanged || !operationExistedBefore) {
      editor.addHistory(this._operation,
        this.getSharedState('initialOptions'),
        this.getSharedState('operationExistedBefore'))
    }

    editor.undoZoom()
    editor.enableFeatures('zoom', 'drag')

    super._onDoneClick(e)
  }

  /**
   * Gets called when the slider value has changed
   * @param {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    this._operation.setBlurRadius(value)

    const { editor } = this.context
    editor.render()
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    return (<div bem='e:cell m:slider'>
      <SliderComponent
        style='large'
        minValue={0}
        maxValue={40}
        valueUnit='px'
        middleDot={false}
        label={this._t('controls.focus.blurRadius')}
        onChange={this._onSliderValueChange}
        value={this._operation.getBlurRadius()} />
    </div>)
  }
}
