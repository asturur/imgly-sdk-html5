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

import { ReactBEM, Constants } from '../../../globals'
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'
import SliderOverlayComponent from '../slider-overlay-component'
import MiniSliderComponent from '../mini-slider-component'

const ITEMS = [
  {
    identifier: 'brightness',
    isSelectable: (editor) => editor.isOperationEnabled('brightness'),
    defaultValue: 0,
    valueMultiplier: 100,
    valueOffset: 0
  },
  {
    identifier: 'saturation',
    isSelectable: (editor) => editor.isOperationEnabled('saturation'),
    defaultValue: 1,
    valueMultiplier: 100,
    valueOffset: -100
  },
  {
    identifier: 'contrast',
    isSelectable: (editor) => editor.isOperationEnabled('contrast'),
    defaultValue: 1,
    valueMultiplier: 100,
    valueOffset: -100
  }
]

export default class AdjustmentsControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onSliderValueChange'
    )

    this.state = { selectedControls: null }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user changes the slider value
   * @param  {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    const { selectedControls } = this.state
    const { identifier, valueMultiplier, valueOffset } = selectedControls
    value = (value - valueOffset) / valueMultiplier
    this._operation.setOption(identifier, value)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  /**
   * Gets called when the user clicks one of the three buttons
   * @param {Object} controlsItem
   * @param {Event} e
   * @private
   */
  _onButtonClick (controlsItem, e) {
    const { editor } = this.context
    const { selectedControls } = this.state

    // Exit current controls
    if (selectedControls) {
      // If value is at default, remove operation
      const value = this._operation.getOption(selectedControls.identifier)
      const defaultValue = this._operation.getOptionDefault(selectedControls.identifier)
      if (value === defaultValue) {
        editor.removeOperation(this._operation)
      }
    }

    // Enter new controls
    this._operation = editor.getOrCreateOperation(controlsItem.identifier)
    this.setState({ selectedControls: controlsItem })
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Builds the props hash passed to the sliders
   * @return {Object}
   */
  _buildSliderProps (controls) {
    let { identifier, defaultValue, valueMultiplier, valueOffset } = controls

    const { editor } = this.context
    const operation = editor.getOperation(identifier)
    const minValue = -1 * valueMultiplier
    const maxValue = 1 * valueMultiplier
    let value = operation
      ? operation.getOption(identifier)
      : defaultValue

    value *= valueMultiplier
    value += valueOffset

    return {
      minValue, maxValue, value,
      valueUnit: '%',
      positiveValuePrefix: '+',
      label: this._t(`controls.adjustments.${identifier}`),
      middleDot: true,
      onChange: this._onSliderValueChange
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  renderOverlayControls () {
    const { selectedControls } = this.state
    if (!selectedControls) return

    const sliderProps = this._buildSliderProps(selectedControls)
    return (<SliderOverlayComponent {...sliderProps} />)
  }

  /**
   * Renders the list items
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    return ITEMS
      .filter((item) => item.isSelectable(this.context.editor))
      .map((item) => {
        const isSelected = this.state.selectedControls === item
        const className = isSelected ? 'is-active' : null

        let miniSlider
        if (!isSelected) {
          const sliderProps = this._buildSliderProps(item)
          miniSlider = (<bem specifier='b:adjustmentsControls'>
            <div bem='e:miniSlider'>
              <MiniSliderComponent {...sliderProps} />
            </div>
          </bem>)
        }

        return (<li
          bem='e:item'
          key={item.identifier}>
          <bem specifier='$b:controls'>
            <div bem='$e:button m:withLabel' onClick={this._onButtonClick.bind(this, item)} className={className}>
              <img bem='e:icon' src={this._getAssetPath(`controls/adjustments/${item.identifier}@2x.png`, true)} />
              <div bem='e:label'>{this._t(`controls.adjustments.${item.identifier}`)}</div>
              {miniSlider}
            </div>
          </bem>
        </li>)
      })
  }

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const listItems = this._renderListItems()

    return (<div bem='e:cell m:list'>
      <ScrollbarComponent>
        <ul bem='$e:list'>
          {listItems}
        </ul>
      </ScrollbarComponent>
    </div>)
  }
}
