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

import { ReactBEM } from '../../../globals'
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'
import SliderOverlayComponent from '../slider-overlay-component'
import MiniSliderComponent from '../mini-slider-component'

const ITEMS = [
  {
    identifier: 'brightness',
    isAvailable: (editor) => editor.isToolEnabled('brightness'),
    defaultValue: 0,
    valueMultiplier: 100,
    valueOffset: 0
  },
  {
    identifier: 'saturation',
    isAvailable: (editor) => editor.isToolEnabled('saturation'),
    defaultValue: 1,
    valueMultiplier: 100,
    valueOffset: -100
  },
  {
    identifier: 'contrast',
    isAvailable: (editor) => editor.isToolEnabled('contrast'),
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

    const { editor } = this.context
    this._operation = editor.getOrCreateOperation('adjustments')

    this.state = { selectedControls: null }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    const { editor } = this.context
    const operationExistedBefore = this.getSharedState('operationExistedBefore')
    const initialOptions = this.getSharedState('initialOptions')

    if (!this._operation.optionsEqual(initialOptions)) {
      editor.addHistory(this._operation,
        initialOptions,
      operationExistedBefore)
    }

    const defaultOptions = this._operation.getDefaultOptions()
    if (this._operation.optionsEqual(defaultOptions)) {
      editor.removeOperation(this._operation)
    }

    super._onBackClick(e)
  }

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

    const { editor } = this.context
    editor.render()
  }

  /**
   * Gets called when the user clicks one of the three buttons
   * @param {Object} controlsItem
   * @param {Event} e
   * @private
   */
  _onButtonClick (controlsItem, e) {
    this.setState({ selectedControls: controlsItem })
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Builds the props hash passed to the sliders
   * @return {Object}
   */
  _buildSliderProps (controls) {
    let { identifier, defaultValue, valueMultiplier, valueOffset } = controls

    const minValue = -1 * valueMultiplier
    const maxValue = 1 * valueMultiplier
    let value = this._operation
      ? this._operation.getOption(identifier)
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
      .filter((item) => item.isAvailable(this.context.editor))
      .map((item) => {
        const isSelected = this.state.selectedControls === item
        const className = isSelected ? 'is-active' : null

        let miniSlider
        if (!isSelected && false) { // Mini sliders temporarily disabled
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
