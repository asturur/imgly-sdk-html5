/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { EventEmitter, SDK, SDKUtils, Constants, Vector2 } from '../globals'
import Exporter from './exporter'

/**
 * The Editor class is an interface to the SDK, managing operations, rendering,
 * history, zoom etc.
 */
export default class Editor extends EventEmitter {
  constructor (options, mediator) {
    super()
    this._options = options
    this._mediator = mediator

    this._initSDK()
    this._initOperations()
    this._initControls()

    this._history = []
    this._operationsMap = {}
    this._operationsStack = this._sdk.getOperationsStack()
    this._preferredOperationOrder = this._options.operationsOrder
  }

  // -------------------------------------------------------------------------- INITIALIZATION

  /**
   * Initializes the SDK
   * @private
   */
  _initSDK () {
    const { image, preferredRenderer } = this._options
    const rendererOptions = {
      image
    }
    this._sdk = new SDK(preferredRenderer, rendererOptions)
  }

  /**
   * Initializes the available and enabled controls
   * @private
   */
  _initOperations () {
    this._availableOperations = this._sdk.getOperations()
    this._enabledOperations = []

    let operationIdentifiers = this._options.operations
    if (!(operationIdentifiers instanceof Array)) {
      operationIdentifiers = operationIdentifiers
        .replace(/\s+?/ig, '')
        .split(',')
    }

    for (let identifier in this._availableOperations) {
      if (this._options.operations === 'all' ||
          operationIdentifiers.indexOf(identifier) !== -1) {
        this._enabledOperations.push(identifier)
      }
    }
  }

  /**
   * Initializes the available and enabled controls
   * @private
   */
  _initControls () {
    // @TODO Use `options.extensions.controls` instead of `options.additionalControls`.
    //       Same goes for operations and languages.
    this._availableControls = SDKUtils.extend({
      filters: require('../components/controls/filters/'),
      orientation: require('../components/controls/orientation/'),
      adjustments: require('../components/controls/adjustments/'),
      crop: require('../components/controls/crop/'),
      focus: require('../components/controls/focus/'),
      frame: require('../components/controls/frame/'),
      stickers: require('../components/controls/stickers/'),
      text: require('../components/controls/text/')
    }, this._options.additionalControls)

    this._enabledControls = []
    for (let identifier in this._availableControls) {
      const controls = this._availableControls[identifier]
      if (!controls.isSelectable || controls.isSelectable(this)) {
        this._enabledControls.push(controls)
      }
    }

    this._enabledControls.sort((a, b) => {
      let sortA = this._options.controlsOrder.indexOf(a.identifier)
      let sortB = this._options.controlsOrder.indexOf(b.identifier)
      if (sortA === -1) return 1
      if (sortB === -1) return -1
      if (sortA < sortB) return -1
      if (sortA > sortB) return 1
      return 0
    })
  }

  // -------------------------------------------------------------------------- PUBLIC HISTORY API

  /**
   * Checks if there are any history items available
   * @return {Boolean}
   */
  historyAvailable () {
    return !!this._history.length
  }

  /**
   * Reverts the last change
   */
  undo () {
    const lastItem = this._history.pop()
    if (lastItem) {
      let { operation, existent, options } = lastItem
      if (!existent) {
        this.removeOperation(operation)
        this.emit('operation-removed', operation)
      } else {
        operation = this.getOrCreateOperation(operation.constructor.identifier)
        operation.set(options)
        this.emit('operation-updated', operation)
      }

      this.emit('history-updated', operation)
    }
  }

  /**
   * Adds the given data to the history
   * @param {Operation} operation
   * @param {Object} options
   * @param {Boolean} existent
   * @return {Object}
   */
  addHistory (operation, options, existent) {
    const historyItem = {
      operation, options, existent
    }
    this._history.push(historyItem)
    this.emit('history-updated', operation)
    return historyItem
  }

  // -------------------------------------------------------------------------- PUBLIC CONTROLS API

  /**
   * Returns the enabled controls
   * @return {Array.<Object>}
   */
  getEnabledControls () {
    return this._enabledControls
  }

  /**
   * Returns the available controls
   * @return {Array.<Object>}
   */
  getAvailableControls () {
    return this._availableControls
  }

  // -------------------------------------------------------------------------- PUBLIC OPERATIONS API

  /**
   * Checks whether the operation with the given identifier is enabled
   * @param  {String}  name
   * @return {Boolean}
   */
  isOperationEnabled (name) {
    return this._enabledOperations.indexOf(name) !== -1
  }

  /**
   * If the operation with the given identifier already exists, it returns
   * the existing operation. Otherwise, it creates and returns a new one.
   * @param  {String} identifier
   * @param  {Object} options
   * @return {PhotoEditorSDK.Operation}
   */
  getOrCreateOperation (identifier, options = {}) {
    if (this._operationsMap[identifier]) {
      return this._operationsMap[identifier]
    } else {
      const Operation = this._availableOperations[identifier]
      const operation = new Operation(this._sdk, options)
      this.addOperation(operation)
      return operation
    }
  }

  /**
   * Adds the given operation to the stack
   * @param {Operation} operation
   */
  addOperation (operation) {
    const identifier = operation.constructor.identifier
    operation.on('updated', () => {
      this._mediator.emit(Constants.EVENTS.OPERATION_UPDATED, operation)
    })
    const index = this._preferredOperationOrder.indexOf(identifier)
    this._operationsStack.set(index, operation)
    this._operationsMap[identifier] = operation
  }

  /**
   * Removes the given operation from the stack
   * @param  {Operation} operation
   */
  removeOperation (operation) {
    const identifier = operation.constructor.identifier
    const stack = this._operationsStack.getStack()

    // Remove operation from map
    if (this._operationsMap[identifier] === operation) {
      delete this._operationsMap[identifier]
    }

    // Remove operation from stack
    const index = stack.indexOf(operation)
    if (index !== -1) {
      this._operationsStack.removeAt(index)

      // Set all following operations to dirty, since they might
      // have cached stuff drawn by the removed operation
      for (let i = index + 1; i < stack.length; i++) {
        const operation = stack[i]
        if (!operation) continue
        operation.setDirty(true)
      }
    }
  }

  /**
   * Returns the operation with the given identifier
   * @param  {String} identifier
   * @return {PhotoEditorSDK.Operation}
   */
  getOperation (identifier) {
    return this._operationsMap[identifier]
  }

  getEnabledOperations () { return this._enabledOperations }

  /**
   * Checks whether an operation with the given identifier exists
   * @param {String} identifier
   * @return {Boolean}
   */
  operationExists (identifier) {
    return !!this._operationsMap[identifier]
  }

  // -------------------------------------------------------------------------- MISC PUBLIC API

  /**
   * Triggers a render
   */
  render () {
    return this._sdk.render()
  }

  /**
   * Returns the output sprite's current dimensions
   * @return {Vector2}
   */
  getOutputDimensions () {
    this._sdk.getSprite().updateTransform()

    const spriteBounds = this._sdk.getSprite().getBounds()
    return new Vector2(spriteBounds.width, spriteBounds.height)
  }

  /**
   * Exports an image
   * @param {Boolean} download = false
   * @return {Promise}
   *  @todo Does this belong here?
   */
  export (download = false) {
    // if (this._watermarkOperation) {
    //   this._watermarkOperation = this.getOperation('watermark')
    //   this._watermarkOperation.setEnabled(false)
    // }

    // Invalidate caches
    this._sdk.setAllOperationsToDirty()

    const options = this._options.export
    const exporter = new Exporter(this._sdk, options, download)
    return exporter.export()
      .then((output) => {
        this.emit('export', output)

        // if (this._watermarkOperation) {
        //   this._watermarkOperation.setEnabled(true)
        // }

        // Invalidate caches
        this._sdk.setAllOperationsToDirty()

        return output
      })
  }

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  getRenderer () { return this._sdk.getRenderer() }
  getSDK () { return this._sdk }
}
