/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { SDK, SDKUtils, Constants } from '../globals'

/**
 * The Editor class is an interface to the SDK, managing operations, rendering,
 * history, zoom etc.
 */
export default class Editor {
  constructor (options, mediator) {
    this._options = options
    this._mediator = mediator

    this._initSDK()
    this._initOperations()
    this._initControls()

    this._operationsMap = {}
    this._operationsStack = this._sdk.getOperationsStack()
    this._preferredOperationOrder = [
      // First, all operations that affect the image dimensions
      'orientation',
      'crop',

      // Then color operations (first filter, then fine-tuning)
      'filter',
      'contrast',
      'brightness',
      'saturation',

      // Then post-processing
      'radial-blur',
      'tilt-shift',
      'frame',
      'sticker',
      'text',
      'watermark'
    ]
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

  // -------------------------------------------------------------------------- PUBLIC CONTROLS API

  /**
   * Returns the enabled controls
   * @return {Array.<Object>}
   */
  getEnabledControls () {
    return this._enabledControls
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
      const operation = new Operation(this._renderer, options)
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

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  getRenderer () { return this._sdk.getRenderer() }
  getSDK () { return this._sdk }
}
