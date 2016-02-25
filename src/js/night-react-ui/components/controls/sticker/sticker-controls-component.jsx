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

import { ReactBEM, BaseComponent } from '../../../globals'
import StickerOverviewControlsComponent from './sticker-overview-controls-component'
import StickerEditControlsComponent from './sticker-edit-controls-component'

export default class StickerControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onSubComponentBack'
    )
    this._operation = this.getSharedState('operation')
    this._initiallyHadSticker = this.getSharedState('selectedSprite')

    const { editor } = this.context
    editor.render()
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
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this._switchBack()
  }

  /**
   * Gets called when the back button in the subcomponent is clicked
   * @private
   */
  _onSubComponentBack () {
    const selectedSprite = this.getSharedState('selectedSprite')
    if (selectedSprite && !this._initiallyHadSticker) {
      this.setSharedState({ selectedSprite: null })
    } else {
      this._switchBack()
    }
  }

  /**
   * Gets called when the shared state has changed
   * @param  {Object} newState
   */
  sharedStateDidChange (newState) {
    if ('selectedSprite' in newState) {
      this.forceUpdate()
    }
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Gets called when the user switches back
   * @private
   */
  _switchBack () {
    this.props.onSwitchControls('back')
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const selectedSprite = this.getSharedState('selectedSprite')

    let ControlsComponent = StickerOverviewControlsComponent
    if (selectedSprite) {
      ControlsComponent = StickerEditControlsComponent
    }

    return (<ControlsComponent
      selectedSprite={selectedSprite}
      onBack={this._onSubComponentBack}
      options={this.props.options}
      sharedState={this.props.sharedState}
      editor={this.props.editor} />)
  }
}
