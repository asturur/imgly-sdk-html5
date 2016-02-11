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
  EventEmitter, SDK, SDKUtils, Constants, Vector2, Utils,
  requestAnimationFrame, cancelAnimationFrame, Promise
} from '../globals'
import Exporter from './exporter'
import Controls from '../components/controls'
import ImageResizer from './image-resizer'

const MIN_ZOOM_DIMENSIONS = 300

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
    this._ready = false

    this._initSDK()
    this._initOperations()
    this._initControls()

    this._features = {
      drag: true,
      zoom: true
    }
    this._history = []
    this._operationsMap = {}
    this._operationsStack = this._sdk.getOperationsStack()
    this._preferredOperationOrder = this._options.operationsOrder

    // Rendering
    this._running = false
    this._renderRequested = true
    this._renderCallbacks = []
    this._animationFrameRequest = null

    // Zoom
    this._previousZoom = null

    this.setZoom = this.setZoom.bind(this)
    this.undoZoom = this.undoZoom.bind(this)
    this.render = this.render.bind(this)
    this._tick = this._tick.bind(this)

    this._mediator.on(Constants.EVENTS.RENDER, this.render)
    this._mediator.on(Constants.EVENTS.ZOOM, this.setZoom)
    this._mediator.on(Constants.EVENTS.ZOOM_UNDO, this.undoZoom)

    this._initWatermark()
    requestAnimationFrame(this._initImage.bind(this))
  }

  // -------------------------------------------------------------------------- INITIALIZATION

  /**
   * Initializes the image resizing etc.
   * @private
   */
  _initImage () {
    const maxPixels = this.getMaxMegapixels() * 1000000
    const maxDimensions = this._sdk.getRenderer().getMaxDimensions()
    const imageResizer = new ImageResizer(
      this._options.image,
      maxPixels,
      maxDimensions
    )

    const done = (image) => {
      this.setImage(image)
      this._ready = true
      this.emit('ready')
    }

    if (!imageResizer.needsResize()) {
      done(this._options.image)
    } else {
      this.emit('resize')
      imageResizer.resize()
        .then(({ canvas, dimensions, reason }) => {
          this.emit('resized', { dimensions, reason })
          done(canvas)
        })
    }
  }

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
  }

  /**
   * Initializes the available and enabled controls
   * @private
   */
  _initControls () {
    const defaultControls = {}
    Controls.forEach((control) => {
      defaultControls[control.identifier] = control
    })
    this._availableControls = SDKUtils.extend(defaultControls, this._options.extensions.controls)
  }

  // -------------------------------------------------------------------------- FEATURES

  /**
   * Checks if the feature with the given identifier is enabled
   * @param  {String}  identifier
   * @return {Boolean}
   */
  isFeatureEnabled (identifier) {
    return this._features[identifier]
  }

  /**
   * Enables the features with the given identifiers
   * @param  {String...} identifiers
   */
  enableFeatures (...identifiers) {
    identifiers.forEach((identifier) => {
      this._features[identifier] = true
    })
    this._mediator.emit(Constants.EVENTS.FEATURES_ENABLED, identifiers)
    this._mediator.emit(Constants.EVENTS.FEATURES_UPDATED, identifiers)
  }

  /**
   * Disables the features with the given identifiers
   * @param  {String...} identifiers
   */
  disableFeatures (...identifiers) {
    console.log(identifiers)
    identifiers.forEach((identifier) => {
      this._features[identifier] = false
    })
    this._mediator.emit(Constants.EVENTS.FEATURES_DISABLED, identifiers)
    this._mediator.emit(Constants.EVENTS.FEATURES_UPDATED, identifiers)
  }

  // -------------------------------------------------------------------------- ZOOMING

  /**
   * Zooms in the editor
   */
  zoomIn () {
    const zoom = this._sdk.getZoom()
    this.setZoom(zoom + 0.1)
  }

  /**
   * Zooms out the editor
   */
  zoomOut () {
    const zoom = this._sdk.getZoom()
    this.setZoom(zoom - 0.1)
  }

  /**
   * Switches to the previous zoom
   */
  undoZoom () {
    if (!this._previousZoom) return
    this.setZoom(this._previousZoom)
    this._previousZoom = null
  }

  /**
   * Returns the current zoom level
   * @return {Number}
   */
  getZoom () { return this._sdk.getZoom() }

  /**
   * Sets the zoom to the given one
   * @param {Number} zoom
   * @param {Function} [callback]
   */
  setZoom (zoom, callback) {
    this._previousZoom = this._sdk.getZoom()

    let newZoom = zoom
    const defaultZoom = this.getDefaultZoom()
    if (zoom === 'auto' || newZoom === defaultZoom) {
      newZoom = defaultZoom
      zoom = 'auto'

      this._isDefaultZoom = true
    } else {
      this._isDefaultZoom = false
    }

    const maxZoom = defaultZoom * 2
    const minZoom = this.getMinimumZoom()
    newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))

    this._sdk.setZoom(newZoom)
    this.render(null, () => {
      this._mediator.emit(Constants.EVENTS.ZOOM_DONE)
      callback && callback()
    })
  }

  /**
   * Returns the default zoom level
   * @return {Number}
   */
  getDefaultZoom () {
    const finalDimensions = this.getFinalDimensions()
    const canvasDimensions = this.getCanvasDimensions()
    const defaultDimensions = SDKUtils.resizeVectorToFit(finalDimensions, canvasDimensions)

    return defaultDimensions
      .divide(finalDimensions)
      .x
  }

  /**
   * Returns the minimum zoom level
   * @return {Number}
   */
  getMinimumZoom () {
    const finalDimensions = this.getFinalDimensions()
    const minimumDimensions = SDKUtils.resizeVectorToFit(
      finalDimensions,
      new Vector2(MIN_ZOOM_DIMENSIONS, MIN_ZOOM_DIMENSIONS)
    )

    return minimumDimensions
      .divide(finalDimensions)
      .x
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
        this._mediator.emit(Constants.EVENTS.OPERATION_REMOVED, operation)
      } else {
        operation = this.getOrCreateOperation(operation.constructor.identifier)
        operation.set(options)
        this._mediator.emit(Constants.EVENTS.OPERATION_UPDATED, operation)
      }

      this._mediator.emit(Constants.EVENTS.HISTORY_UPDATED, operation)
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
    this._mediator.emit(Constants.EVENTS.HISTORY_UPDATED, operation)
    return historyItem
  }

  // -------------------------------------------------------------------------- PUBLIC CONTROLS API

  /**
   * Checks if the control with the given identifier is selectable
   * @param  {String}  identifier
   * @return {Boolean}
   */
  isControlEnabled (identifier) {
    const control = this.getControl(identifier)
    if (!control) return false

    return control.isAvailable && control.isAvailable(this)
  }

  /**
   * Returns the control with the given identifier
   * @param  {String} identifier
   * @return {Control}
   */
  getControl (identifier) {
    return this._availableControls[identifier]
  }

  /**
   * Returns the available controls
   * @return {Array.<Object>}
   */
  getAvailableControls () {
    return this._availableControls
  }

  /**
   * Checks if the control with the tool identifier is enabled
   * @param  {String}  identifier
   * @return {Boolean}
   */
  isToolEnabled (identifier) {
    return this._options.tools.indexOf(identifier) !== -1
  }

  // -------------------------------------------------------------------------- PUBLIC OPERATIONS API

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

  /**
   * Checks whether an operation with the given identifier exists
   * @param {String} identifier
   * @return {Boolean}
   */
  operationExists (identifier) {
    return !!this._operationsMap[identifier]
  }

  // -------------------------------------------------------------------------- MISC PRIVATE API

  /**
   * Returns the maximum mega pixels
   * @return {Number}
   * @private
   */
  getMaxMegapixels () {
    const { maxMegaPixels } = this._options
    return Utils.isMobile() ? maxMegaPixels.mobile : maxMegaPixels.desktop
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
    return this._sdk.getFinalDimensions()
  }

  /**
   * Returns the canvas dimensions
   * @return {Vector2}
   */
  getCanvasDimensions () {
    const canvas = this._sdk.getCanvas()
    return new Vector2(canvas.offsetWidth, canvas.offsetHeight)
  }

  /**
   * Sets the given image
   * @param {Image} image
   */
  setImage (image) {
    this._options.image = image
    this._sdk.setImage(image)
    this.reset()

    this.emit('new-image')
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
    this.setZoom('auto')
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
   * Returns the current offset
   * @returns {Vector2}
   */
  getOffset () {
    return this._sdk.getOffset()
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
    if (!this._ready) return Promise.resolve()

    return this._sdk.render()
      .then(() => {
        this._lastOutputBounds = this._sdk.getSprite().getBounds()
      })
  }

  /**
   * Resets everything
   */
  reset () {
    this._sdk.reset()
    this._history = []
    this._operationsMap = {}
  }

  // -------------------------------------------------------------------------- DISPOSAL

  /**
   * Cleans this instance up
   */
  dispose () {
    this.stop()

    this._sdk.dispose()
    this._mediator.off(Constants.EVENTS.RENDER, this.render)
    this._mediator.off(Constants.EVENTS.ZOOM, this.setZoom)
    this._mediator.off(Constants.EVENTS.ZOOM_UNDO, this.undoZoom)
  }

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  isReady () { return this._ready }
  getRenderer () { return this._sdk.getRenderer() }
  getSDK () { return this._sdk }
  isDefaultZoom () { return this._isDefaultZoom }
  getLastOutputBounds () { return this._lastOutputBounds }
  getInputDimensions () { return this._sdk.getInputDimensions() }
}
