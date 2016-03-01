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
import BackButtonComponent from '../back-button-component'
import DoneButtonComponent from '../done-button-component'

export default class ControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._hasBackButton = true
    this._hasDoneButton = false
    this._backButtonClicked = false

    this._bindAll(
      '_onBackClick',
      '_onDoneClick'
    )
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this._backButtonClicked = true
    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the user clicks the done button
   * @param {Event} e
   * @private
   */
  _onDoneClick (e) {
    this.props.onSwitchControls('back')
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    return null
  }

  /**
   * Renders the overlay controls of this component
   * @return {ReactBEM.Element}
   */
  renderOverlayControls () {
    return null
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const backButton = this._hasBackButton
      ? <BackButtonComponent onClick={this._onBackClick} />
      : null

    const doneButton = this._hasDoneButton
      ? <DoneButtonComponent onClick={this._onDoneClick} />
      : null

    return (<div bem='$b:controls'>
      {this.renderOverlayControls()}
      <div bem='e:table'>
        {backButton}
        {this.renderControls()}
        {doneButton}
      </div>
    </div>)
  }
}
