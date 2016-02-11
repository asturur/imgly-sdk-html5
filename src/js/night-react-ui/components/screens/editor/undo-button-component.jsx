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

import { ReactBEM, Constants, BaseComponent } from '../../../globals'
import SubHeaderButtonComponent from '../../sub-header-button-component'

export default class UndoButtonComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onButtonClick',
      '_onHistoryUpdated',
      '_onFeaturesUpdated'
    )

    this._events = {
      [Constants.EVENTS.HISTORY_UPDATED]: this._onHistoryUpdated,
      [Constants.EVENTS.FEATURES_UPDATED]: this._onFeaturesUpdated
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the features have been enabled or disabled
   * @private
   */
  _onFeaturesUpdated () {
    this.forceUpdate()
  }

  /**
   * Gets called when the history has been updated
   * @private
   */
  _onHistoryUpdated () {
    this.forceUpdate()
  }

  /**
   * Gets called when the button has been clicked
   * @private
   */
  _onButtonClick () {
    const { editor } = this.context
    editor.undo()
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { editor } = this.context
    if (!editor.historyAvailable()) return null

    return (<SubHeaderButtonComponent
      label={this._t('editor.undo')}
      icon='editor/undo@2x.png'
      onClick={this._onButtonClick} />)
  }
}
