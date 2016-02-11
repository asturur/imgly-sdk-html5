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
import NewFileButtonComponent from './new-file-button-component'
import ExportButtonComponent from './export-button-component'
import UndoButtonComponent from './undo-button-component'
import ZoomComponent from './zoom-component'

export default class EditorSubHeaderComponent extends SubHeaderComponent {
  /**
   * Renders the content of this SubHeaderComponent
   * @return {ReactBEM.Element}
   */
  renderContent () {
    return (<bem specifier='$b:subHeader'>
      <div bem='e:left'>
        <NewFileButtonComponent app={this.props.app} />
      </div>

      <div bem='e:right'>
        <UndoButtonComponent />
        <ExportButtonComponent />
      </div>

      <ZoomComponent />
    </bem>)
  }
}
