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
import { ReactBEM, BaseComponent } from '../../globals'

export default class MiniSliderComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this.state = {
      value: this.props.value || 0,
      sliderPosition: 0,
      foregroundLeft: 0,
      foregroundWidth: 0
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after the component has been mounted
   */
  componentDidMount () {
    // Trigger a re-render to position the knob
    this._setValue(this.state.value, false)
  }

  /**
   * Gets called when this component receives new props
   * @param  {Object} props
   */
  componentWillReceiveProps (props) {
    if (props.value !== this.state.value) {
      this._setValue(props.value, false)
    }
  }

  /**
   * Returns the style for the knob (position)
   * @return {Object}
   * @private
   */
  _getKnobStyle () {
    return { left: this.state.sliderPosition }
  }

  /**
   * Returns the style for the foreground bar
   * @return {Object}
   * @private
   */
  _getForegroundStyle () {
    return {
      left: this.state.foregroundLeft,
      width: this.state.foregroundWidth
    }
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Decides whether or not this slider should have a middle dot on the bar
   * @private
   */
  _displayMiddleDot () {
    return this.props.middleDot !== false
  }

  /**
   * Sets the value to the given value, updates the slider position
   * @param {Number} value
   * @param {Boolean} emitChange = true
   * @private
   */
  _setValue (value, emitChange = true) {
    value = Math.round(value)
    const { minValue, maxValue } = this.props
    const progress = (value - minValue) / (maxValue - minValue)

    // Calculate slider position
    const { bar } = this.refs
    const barWidth = bar.offsetWidth
    const sliderPosition = barWidth * progress

    // Calculate foreground position and width
    let foregroundWidth = progress * barWidth
    let foregroundLeft = 0
    if (this._displayMiddleDot()) {
      foregroundWidth = Math.abs(progress - 0.5) * barWidth
      foregroundLeft = progress < 0.5
        ? (barWidth * 0.5 - foregroundWidth)
        : '50%'
    }

    this.setState({ value, sliderPosition, foregroundWidth, foregroundLeft })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const foregroundProps = {
      style: this._getForegroundStyle()
    }

    return (<div bem='$b:miniSlider'>
      <div bem='$e:bar' ref='bar'>
        <div bem='$e:background' />
        <div bem='$e:foreground' {...foregroundProps}/>
        <div bem='e:knob' style={this._getKnobStyle()}></div>
      </div>
    </div>)
  }
}
