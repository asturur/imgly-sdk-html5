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

import { SDKUtils, ReactBEM, BaseComponent } from '../../globals'
import SliderComponent from '../slider-component'

export default class SliderOverlayComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onSliderValueChange'
    )

    this.state = { value: this.props.value }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component receives new props
   * @param  {Object} props
   */
  componentWillReceiveProps (props) {
    if (props.value !== this.state.value) {
      this.state.value = props.value
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the slider value has changed
   * @param  {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    this.props.onChange &&
      this.props.onChange(value)
    this.setState({ value })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const props = SDKUtils.defaults(this.props, {
      style: '',
      middleDot: false,
      minValue: 1,
      maxValue: 100,
      label: 'Label',
      onChange: this._onSliderValueChange,
      value: this.state.value
    })

    return (<div bem='$b:controls e:overlay m:large m:dark'>
      <SliderComponent {...props} />
    </div>)
  }
}
