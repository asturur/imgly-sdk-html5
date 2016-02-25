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

import { ReactBEM, SDKUtils } from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'
import ControlsComponent from '../controls-component'
import MiniSliderComponent from '../mini-slider-component'
import SliderOverlayComponent from '../slider-overlay-component'

const ADJUSTMENTS_ITEMS = {
  brightness: {
    identifier: 'brightness',
    defaultValue: 0,
    valueMultiplier: 100,
    valueOffset: 0
  },
  saturation: {
    identifier: 'saturation',
    defaultValue: 1,
    valueMultiplier: 100,
    valueOffset: -100
  },
  contrast: {
    identifier: 'contrast',
    defaultValue: 1,
    valueMultiplier: 100,
    valueOffset: -100
  }
}

export default class StickerEditControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onSliderValueChange'
    )

    this.state = {
      selectedControls: null
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onBack()
  }

  /**
   * Gets called when the user clicks on an adjustments button
   * @param {String} identifier
   * @private
   */
  _onAdjustmentsClick (identifier) {
    this.setState({
      selectedControls: identifier
    })
  }

  /**
   * Gets called when the user flips a sticker
   * @param  {String} direction
   * @private
   */
  _onFlipClick (direction) {
    const selectedSprite = this.getSharedState('selectedSprite')
    switch (direction) {
      case 'h':
        selectedSprite.setFlipHorizontally(!selectedSprite.getFlipHorizontally())
        break
      case 'v':
        selectedSprite.setFlipVertically(!selectedSprite.getFlipVertically())
        break
    }

    this.setState({ selectedControls: null })
  }

  /**
   * Gets called when the user changes the slider value
   * @param  {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    const { selectedControls } = this.state
    const { valueMultiplier, valueOffset } = ADJUSTMENTS_ITEMS[selectedControls]
    value = (value - valueOffset) / valueMultiplier

    const selectedSprite = this.getSharedState('selectedSprite')
    const adjustments = selectedSprite.getAdjustments()
    adjustments.setOption(selectedControls, value)
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Builds the props hash passed to the sliders
   * @return {Object}
   */
  _buildSliderProps (identifier) {
    const { valueMultiplier, valueOffset } = ADJUSTMENTS_ITEMS[identifier]

    const minValue = -1 * valueMultiplier
    const maxValue = 1 * valueMultiplier

    const selectedSprite = this.getSharedState('selectedSprite')
    const adjustments = selectedSprite.getAdjustments()
    let value = adjustments.getOption(identifier)
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
    if (!ADJUSTMENTS_ITEMS[selectedControls]) return

    const sliderProps = this._buildSliderProps(selectedControls)
    return (<SliderOverlayComponent {...sliderProps} />)
  }

  /**
   * Returns this control's options
   * @return {Object}
   * @private
   */
  _getControlsOptions () {
    const { options } = this.context
    const stickers = options.controlsOptions.stickers || {}

    let defaultOptions = {
      flip: true
    }
    for (let identifier in ADJUSTMENTS_ITEMS) {
      defaultOptions[identifier] = true
    }

    stickers.tools = SDKUtils.defaults(stickers.tools || {}, defaultOptions)
    options.controlsOptions.stickers = stickers
    return stickers
  }

  /**
   * Renders the adjustments item for the given identifier
   * @param  {String} identifier
   * @return {ReactBEM.Element}
   * @private
   */
  _renderAdjustmentsItem (identifier) {
    const isSelected = this.state.selectedControls === identifier
    const className = isSelected ? 'is-active' : null

    let miniSlider
    if (!isSelected && false) { // MiniSlider temporarily disable sliders
      const sliderProps = this._buildSliderProps(identifier)
      miniSlider = (<bem specifier='b:adjustmentsControls'>
        <div bem='e:miniSlider'>
          <MiniSliderComponent {...sliderProps} />
        </div>
      </bem>)
    }

    return (<li
      bem='e:item'
      key={identifier}>
      <bem specifier='$b:controls'>
        <div bem='$e:button m:withLabel' onClick={this._onAdjustmentsClick.bind(this, identifier)} className={className}>
          <img bem='e:icon' src={this._getAssetPath(`controls/adjustments/${identifier}@2x.png`, true)} />
          <div bem='e:label'>{this._t(`controls.adjustments.${identifier}`)}</div>
          {miniSlider}
        </div>
      </bem>
    </li>)
  }

  /**
   * Renders a flip item with the given direction
   * @param  {String} direction
   * @return {ReactBEM.Element}
   * @private
   */
  _renderFlipItem (direction) {
    return (<li
      bem='e:item'
      key={direction}
      onClick={this._onFlipClick.bind(this, direction)}>
        <bem specifier='$b:controls'>
          <div bem='$e:button m:withLabel'>
            <img bem='e:icon' src={this._getAssetPath(`controls/orientation/flip-${direction}@2x.png`, true)} />
            <div bem='e:label'>{this._t(`controls.sticker.flip-${direction}`)}</div>
          </div>
        </bem>
    </li>)
  }

  /**
   * Renders the list items
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    const options = this._getControlsOptions()
    let items = []

    for (let identifier in ADJUSTMENTS_ITEMS) {
      if (options.tools[identifier]) {
        items.push(this._renderAdjustmentsItem(identifier))
      }
    }

    if (items.length && options.tools.flip) {
      items.push(<li bem='e:separator'></li>)
    }

    if (options.tools.flip) {
      items.push(this._renderFlipItem('h'))
      items.push(this._renderFlipItem('v'))
    }

    return items
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
