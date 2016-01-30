/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import {
  EventEmitter, SDK, SDKUtils, Constants, Vector2,
  requestAnimationFrame, cancelAnimationFrame
} from '../globals'
import FPSCounter from './fps-counter'
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
    this._isDefaultZoom = false

    this._initSDK()
    this._initOperations()
    this._initControls()

    this._history = []
    this._operationsMap = {}
    this._operationsStack = this._sdk.getOperationsStack()
    this._preferredOperationOrder = this._options.operationsOrder

    // Rendering
    this._running = false
    this._renderRequested = true
    this._renderCallbacks = []
    this._animationFrameRequest = null

    this.render = this.render.bind(this)
    this._tick = this._tick.bind(this)

    this._mediator.on(Constants.EVENTS.CANVAS_RENDER, this.render)

    this._initWatermark()
  }

  // -------------------------------------------------------------------------- INITIALIZATION

  /**
   * Initializes the watermark operation
   * @private
   */
  _initWatermark () {
    if (this._options.watermark) {
      this._watermarkOperation = this.getOrCreateOperation('watermark', {
        image: this._options.watermark
      })
    }
  }

  /**
   * Initializes the SDK
   * @private
   */
  _initSDK () {
    const { image, preferredRenderer, logLevel } = this._options
    const rendererOptions = {
      image,
      logLevel
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
        this.emit(Constants.EVENTS.OPERATION_REMOVED, operation)
      } else {
        operation = this.getOrCreateOperation(operation.constructor.identifier)
        operation.set(options)
        this.emit(Constants.EVENTS.OPERATION_UPDATED, operation)
      }

      this._mediator.emit(Constants.EVENTS.HISTORY_UNDO, operation)
      this.render()
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
    this.emit(Constants.EVENTS.HISTORY_UPDATED, operation)
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
    if (index === -1) {
      throw new Error(`Editor#addOperation: \`${identifier}\` does not appear in \`preferredOperationOrder\``)
    }
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
   * Returns the output sprite's current dimensions
   * @return {Vector2}
   */
  getOutputDimensions () {
    return new Vector2(this._lastOutputBounds.width, this._lastOutputBounds.height)
  }

  /**
   * Returns the final dimensions that the input image would have
   * after all existing operations have been applied
   * @return {Vector2}
   */
  getFinalDimensions () {
    let inputDimensions = this._sdk.getInputDimensions()
    const operationsStack = this._sdk.getOperationsStack()

    operationsStack.forEach((operation) => {
      inputDimensions = operation.getNewDimensions(inputDimensions)
    })

    return inputDimensions
  }

  /**
   * Sets the given zoom level
   * @param {Boolean}  zoom
   * @param {Boolean} isDefault
   */
  setZoom (zoom, isDefault = false) {
    this._isDefaultZoom = isDefault
    this._sdk.setZoom(zoom)
  }

  /**
   * Exports an image
   * @param {Boolean} download = false
   * @return {Promise}
   * @todo Does this belong here?
   */
  export (download = false) {
    if (this._watermarkOperation) {
      this._watermarkOperation.setEnabled(false)
    }

    // Invalidate caches
    this._sdk.setAllOperationsToDirty()

    const options = this._options.export
    const exporter = new Exporter(this._sdk, options, download)
    return exporter.export()
      .then((output) => {
        this.emit('export', output)

        if (this._watermarkOperation) {
          this._watermarkOperation.setEnabled(true)
        }

        // Invalidate caches
        this._sdk.setAllOperationsToDirty()

        return output
      })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Starts the render loop
   */
  start () {
    this._animationFrameRequest = requestAnimationFrame(this._tick)
  }

  /**
   * Stops the render loop
   */
  stop () {
    this._running = false
    if (this._animationFrameRequest) {
      cancelAnimationFrame(this._animationFrameRequest)
      this._renderCallbacks = []
    }
  }

  /**
   * Requests a render, adds `callback` to the render callbacks
   * @param  {Number}   [zoom]
   * @param  {Function} [callback]
   */
  render (zoom, callback) {
    if (zoom) {
      this._sdk.setZoom(zoom)
      this._renderCallbacks.push(() => {
        this._fixOffset()
      })
    }

    this._renderRequested = true
    if (callback) {
      this._renderCallbacks.push(callback)
    }
  }

  /**
   * Sets the offset to the given one
   * @param {Vector2} offset
   */
  setOffset (offset) {
    offset = this._clampOffset(offset)

    const initialOffset = this._sdk.getOffset()
    if (!initialOffset.equals(offset)) {
      this._sdk.setOffset(offset)
      this.render()
    }
  }

  /**
   * Makes sure the image stays inside the viewport
   * @private
   */
  _fixOffset () {
    this.setOffset(this._sdk.getOffset())
  }

  /**
   * Fixes the given offset to make sure the image stays inside the viewport
   * @private
   */
  _clampOffset (offset) {
    const renderer = this._sdk.getRenderer()
    const rendererDimensions = new Vector2(renderer.getWidth(), renderer.getHeight())
    const outputDimensions = this.getOutputDimensions()

    const minOffset = rendererDimensions.clone()
      .subtract(outputDimensions)
      .divide(2)
      .clamp(null, new Vector2(0, 0))

    const maxOffset = outputDimensions.clone()
      .subtract(rendererDimensions)
      .divide(2)
      .clamp(new Vector2(0, 0), null)

    const newOffset = offset.clone()
      .clamp(minOffset, maxOffset)
      .round()

    return newOffset
  }

  /**
   * Gets called when an animation frame is being processed. Renders the
   * canvas if necessary, requests another animation frame callbacks
   * @private
   */
  _tick () {
    if (this._renderRequested) {
      this._render()
        .then(() => {
          this._renderCallbacks.forEach((r) => r())
          this._renderCallbacks = []
        })

      this._renderRequested = false
    }
    this._animationFrameRequest = requestAnimationFrame(this._tick)
  }

  /**
   * Triggers a render
   * @internal
   */
  _render () {
    return this._sdk.render()
      .then(() => {
        this._lastOutputBounds = this._sdk.getSprite().getBounds()
      })
  }

  // -------------------------------------------------------------------------- DISPOSAL

  dispose () {
    this.stop()

    this._mediator.off(Constants.EVENTS.CANVAS_RENDER, this.render)
  }

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  getRenderer () { return this._sdk.getRenderer() }
  getSDK () { return this._sdk }
  isDefaultZoom () { return this._isDefaultZoom }
  getLastOutputBounds () { return this._lastOutputBounds }
  getInputDimensions () { return this._sdk.getInputDimensions() }
}
