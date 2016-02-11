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
import SubHeaderComponent from '../../sub-header-component'
import SubHeaderButtonComponent from '../../sub-header-button-component'
import NewFileButtonComponent from './new-file-button-component'
import ExportButtonComponent from './export-button-component'
import ZoomComponent from './zoom-component'

export default class EditorSubHeaderComponent extends SubHeaderComponent {
  constructor (...args) {
    super(...args)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the undo button (if available)
   * @return {ReactBEM.Element}
   * @private
   */
  _renderUndoButton () {
    const { editor } = this.context
    if (!editor.historyAvailable()) return

    return (<SubHeaderButtonComponent
      label={this._t('editor.undo')}
      icon='editor/undo@2x.png'
      onClick={this._onUndoClick} />)
  }

  /**
   * Renders the content of this SubHeaderComponent
   * @return {ReactBEM.Element}
   */
  renderContent () {
    return (<bem specifier='$b:subHeader'>
      <div bem='e:left'>
        <NewFileButtonComponent />
      </div>

      <div bem='e:right'>
        {this._renderUndoButton()}
        <ExportButtonComponent />
      </div>

      <ZoomComponent />
    </bem>)
  }
}
