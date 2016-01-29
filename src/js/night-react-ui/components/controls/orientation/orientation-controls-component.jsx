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

import { ReactBEM, Constants, Vector2 } from '../../../globals'
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
    this._cropOperation = this.context.editor.getOperation('crop')
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
    this._rotateCrop(additionalDegrees)

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
      this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto')
    } else {
      this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
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

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- GETTERS

  /**
   * Returns or create the flip operation
   * @return {FlipOperation}
   * @private
   */
  _getFlipOperation () {
    const { editor } = this.context
    this._flipOperation = editor.getOrCreateOperation('flip')
    return this._flipOperation
  }

  /**
   * Returns or create the rotation operation
   * @return {RotationOperation}
   * @private
   */
  _getRotationOperation () {
    const { editor } = this.context
    this._rotationOperation = editor.getOrCreateOperation('rotation')
    return this._rotationOperation
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Rotates the current crop options by the given degrees
   * @param  {Number} degrees
   * @todo   Move this to CropOperation
   * @private
   */
  _rotateCrop (degrees) {
    if (!this._cropOperation) return

    let start = this._cropOperation.getStart().clone()
    let end = this._cropOperation.getEnd().clone()

    const _start = start.clone()
    switch (degrees) {
      case 90:
        start = new Vector2(1.0 - end.y, _start.x)
        end = new Vector2(1.0 - _start.y, end.x)
        break
      case -90:
        start = new Vector2(_start.y, 1.0 - end.x)
        end = new Vector2(end.y, 1.0 - _start.x)
        break
    }

    this._cropOperation.set({ start, end })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the list items for this control
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    const itemsMap = [
      { identifier: 'rotate-l', onClick: this._onRotateClick.bind(this, 'left') },
      { identifier: 'rotate-r', onClick: this._onRotateClick.bind(this, 'right') },
      null, // gap
      { identifier: 'flip-h', onClick: this._onFlipClick.bind(this, 'horizontal') },
      { identifier: 'flip-v', onClick: this._onFlipClick.bind(this, 'vertical') }
    ]

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
