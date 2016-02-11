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
import ModalManager from '../../../lib/modal-manager'
import SubHeaderButtonComponent from '../../sub-header-button-component'

export default class ExportButtonComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onButtonClick'
    )
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the button has been clicked
   * @private
   */
  _onButtonClick () {
    const { options, editor, editorScreen } = this.context
    const exportOptions = options.export

    editorScreen.switchToControls('home', null, () => {
      const loadingModal = ModalManager.instance.displayLoading(this._t('loading.exporting'))

      // Give it some time to display the loading modal
      setTimeout(() => {
        editor.export(exportOptions.download)
          .then(() => {
            loadingModal.close()
          })
      }, 1000)
    })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { options } = this.context
    if (!options.export.showButton) return

    return (<SubHeaderButtonComponent
      style='blue'
      label={options.export.label || this._t('editor.export')}
      icon='editor/export@2x.png'
      onClick={this._onButtonClick} />)
  }
}
