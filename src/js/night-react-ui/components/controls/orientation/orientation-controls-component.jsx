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

import { ReactBEM, Constants } from '../../../globals'
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'

export default class OrientationControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onRotateClick',
      '_onFlipClick',
      '_onOperationUpdated',
      '_onOperationRemoved'
    )
    this._operation = this.getSharedState('operation')
    this._operationExistedBefore = this.getSharedState('operationExistedBefore')

    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated,
      [Constants.EVENTS.OPERATION_REMOVED]: this._onOperationRemoved
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    super._onBackClick(e)

    const initialOptions = this.getSharedState('initialOptions')
    if (this._operation.optionsEqual(initialOptions)) {
      const { editor } = this.context
      editor.removeOperation(this._operation)
    }
  }

  /**
   * Gets called when an operation has been updated
   * @param  {Operation} operation
   * @private
   */
  _onOperationUpdated (operation) {
    if (operation === this._operation) {
      this.forceUpdate()
    }
  }

  /**
   * Gets called when an operation is removed
   * @param  {Operation} operation
   * @private
   */
  _onOperationRemoved (operation) {
    if (operation !== this._operation) return

    // Operation can be removed by the undo button. We need
    // to make sure we re-create the operation for the lifetime
    // of this control
    const { editor } = this.context
    const newOperation = editor.getOrCreateOperation('orientation')
    this._operation = newOperation
    this._historyItem = null
    this.setSharedState({
      operation: newOperation,
      operationExistedBefore: false,
      initialOptions: this._operation.serializeOptions()
    })
  }

  /**
   * Gets called when the user clicks a rotation button
   * @param {String} direction
   * @private
   */
  _onRotateClick (direction) {
    const previousOptions = this._operation.serializeOptions()

    const degrees = this._operation.getRotation()
    const additionalDegrees = 90 * (direction === 'left' ? -1 : 1)
    const newDegrees = (degrees + additionalDegrees) % 360
    this._operation.setRotation(newDegrees)

    const flipVertically = this._operation.getFlipVertically()
    const flipHorizontally = this._operation.getFlipHorizontally()

    if (flipVertically !== flipHorizontally) {
      this._operation.set({
        flipVertically: !flipHorizontally,
        flipHorizontally: !flipVertically
      })
    }

    const { editor } = this.context
    editor.addHistory(this._operation,
      previousOptions,
      this._operationExistedBefore)

    this._operationExistedBefore = true

    if (editor.isDefaultZoom()) {
      editor.setZoom('auto')
    } else {
      editor.render()
    }
  }

  /**
   * Gets called when the user clicks a flip button
   * @param {String} direction
   * @private
   */
  _onFlipClick (direction) {
    const previousOptions = this._operation.serializeOptions()

    const rotation = this._operation.getRotation()
    if (rotation === 90 || rotation === 270) {
      if (direction === 'vertical') {
        direction = 'horizontal'
      } else {
        direction = 'vertical'
      }
    }

    switch (direction) {
      case 'horizontal':
        const horizontal = this._operation.getFlipHorizontally()
        this._operation.setFlipHorizontally(!horizontal)
        break
      case 'vertical':
        const vertical = this._operation.getFlipVertically()
        this._operation.setFlipVertically(!vertical)
        break
    }

    const { editor } = this.context
    editor.addHistory(this._operation,
      previousOptions,
      this._operationExistedBefore)
    editor.render()
  }

  // -------------------------------------------------------------------------- MISC

  _getListItems () {
    const { editor } = this.context
    const rotationEnabled = editor.isToolEnabled('rotation')
    const flipEnabled = editor.isToolEnabled('flip')

    let items = []
    if (rotationEnabled) {
      items = items.concat([
        { identifier: 'rotate-l', onClick: this._onRotateClick.bind(this, 'left') },
        { identifier: 'rotate-r', onClick: this._onRotateClick.bind(this, 'right') }
      ])
    }

    if (rotationEnabled || flipEnabled) {
      items.push(null) // gap
    }

    if (flipEnabled) {
      items = items.concat([
        { identifier: 'flip-h', onClick: this._onFlipClick.bind(this, 'horizontal') },
        { identifier: 'flip-v', onClick: this._onFlipClick.bind(this, 'vertical') }
      ])
    }

    return items
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the list items for this control
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    const itemsMap = this._getListItems()

    return itemsMap.map((item) => {
      if (item === null) {
        return (<li bem='e:item m:gap' key='gap' />)
      }

      return (<li
        bem='e:item'
        key={item.identifier}>
        <bem specifier='$b:controls'>
          <div bem='$e:button m:withLabel' onClick={item.onClick}>
            <img bem='e:icon' src={this._getAssetPath(`controls/orientation/${item.identifier}@2x.png`, true)} />
            <div bem='e:label'>{this._t(`controls.orientation.${item.identifier}`)}</div>
          </div>
        </bem>
      </li>)
    })
  }

  /**
   * Renders the controls of this component
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
