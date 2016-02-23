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

import { ReactBEM, BaseComponent } from '../globals'

export default class SubHeaderComponent extends BaseComponent {
  /**
   * Renders the content of this SubHeaderComponent
   * @return {ReactBEM.Element}
   */
  renderContent () {
    return null
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='$b:subHeader e:row'>
      <div bem='e:cell'>
        {this.renderContent()}
      </div>
    </div>)
  }
}
