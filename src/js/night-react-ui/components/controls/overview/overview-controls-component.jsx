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
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'

export default class OverviewControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)
    this._hasBackButton = false
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an item has been clicked
   * @param  {Event} e
   * @private
   */
  _onItemClick (controls) {
    this.props.onSwitchControls(controls)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the list items for this control
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    const { editor } = this.context

    let items = []
    const makeItem = (identifier) => {
      const control = editor.getControl(identifier)
      return (<li
          bem='e:item'
          key={control.identifier}
          onClick={this._onItemClick.bind(this, control)}>
            <bem specifier='$b:controls'>
              <div bem='$e:button m:withLabel'>
                <img bem='e:icon' src={this._getAssetPath(control.icon, true)} />
                <div bem='e:label'>{this._t(control.label)}</div>
              </div>
            </bem>
        </li>)
    }

    const { controlsOrder } = this.context.options
    controlsOrder.forEach((groupOrIdentifier) => {
      if (Array.isArray(groupOrIdentifier)) {
        const group = groupOrIdentifier

        let groupItems = []
        group.forEach((identifier) => {
          if (!editor.isControlEnabled(identifier)) return
          groupItems.push(makeItem(identifier))
        })

        if (groupItems.length) {
          if (groupOrIdentifier !== controlsOrder[controlsOrder.length - 1]) {
            groupItems.push(<li bem='e:separator'></li>)
          }
          items = items.concat(groupItems)
        }
      } else {
        const identifier = groupOrIdentifier
        if (!editor.isControlEnabled(identifier)) return
        items.push(makeItem(identifier))
      }
    })

    return items
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const listItems = this._renderListItems()

    return (<div bem='e:cell m:list'>
      <ScrollbarComponent>
        <ul bem='$e:list'>
          {listItems}
        </ul>
      </ScrollbarComponent>
    </div>)
  }
}
