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

import { ReactBEM } from '../../../../../globals'
import ControlsComponent from '../../../controls-component'
import SliderComponent from '../../../../slider-component'

export default class StickersContrastControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onSliderValueChange'
    )
    this._operation = this.getSharedState('operation')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the slider value has changed
   * @param {Number} value
   * @private
   */
  _onSliderValueChange (value) {
    const selectedSticker = this.getSharedState('selectedSprite')
    let stickerAdjustments = selectedSticker.getAdjustments()
    stickerAdjustments.setContrast((value + 100) / 100)
    this.forceSharedUpdate()
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const selectedSticker = this.getSharedState('selectedSprite')
    const adjustments = selectedSticker.getAdjustments()
    const contrast = adjustments.getContrast()

    return (<div bem='e:cell m:slider'>
      <SliderComponent
        style='large'
        minValue={-100}
        maxValue={100}
        valueUnit='%'
        positiveValuePrefix='+'
        label={this._t('controls.adjustments.contrast')}
        onChange={this._onSliderValueChange}
        value={contrast * 100 - 100} />
    </div>)
  }
}

StickersContrastControlsComponent.identifier = 'contrast'
