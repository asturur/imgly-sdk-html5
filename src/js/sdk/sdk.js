/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import
  { Constants, Engine, Utils, EventEmitter, Vector2, Log, requestAnimationFrame }
from './globals'
import OperationsStack from './lib/operations-stack'
import VersionChecker from './lib/version-checker'
import Operations from './operations/'
import Exif from './lib/exif'
import ImageExporter from './lib/image-exporter'
import PerformanceTest from './lib/performance-test'

const { RenderType, ImageFormat, Events } = Constants

export default class PhotoEditorSDK extends EventEmitter {
  constructor (preferredRenderer, options = {}) {
    super()

    this._onOperationUpdate = this._onOperationUpdate.bind(this)
    this._onContextRestored = this._onContextRestored.bind(this)

    const { version } = require('../../../package.json')
    this.version = version

    this._preferredRenderer = preferredRenderer
    this._options = Utils.defaults(options, {
      extensions: {},
      renderMode: 'dynamic',
      versionCheck: true,
      image: null,
      dimensions: null,
      canvas: null,
      zoom: 1,
      logLevel: 'warn',
      pixelRatio: (window && window.devicePixelRatio) || 1
    })

    this._options.extensions = Utils.defaults(this._options.extensions, {
      operations: [],
      controls: [],
      languages: []
    })

    Log.setLevel(this._options.logLevel)

    this._offset = new Vector2()
    this._zoom = this._options.zoom
    this._operations = {}
    this._renderMode = this._options.renderMode
    this._operationsStack = null
    this.setOperationsStack(new OperationsStack())

    // Engine stuff
    this._container = new Engine.Container()
    this._sprite = new Engine.Sprite()
    this._container.addChild(this._sprite)

    this._inputBaseTexture = null
    this._inputTexture = null

    if (this._options.image) {
      this.setImage(this._options.image)
    }

    this._checkForUpdates()
    this._registerOperations()
    this._initRenderer()

    const renderer = this._renderer.constructor.name
    Log.log('Yo!', `Version: ${this.version} (${renderer}) - https://www.photoeditorsdk.com`)

    // Async image handling
    requestAnimationFrame(this._init.bind(this))
  }

  /**
   * Initializes the SDK
   */
  _init () {
    if (this._options.image) {
      this.setImage(this._options.image)
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an operation is updated. Delegates the event.
   * @private
   */
  _onOperationUpdate (...args) {
    this.emit(Events.OPERATION_UPDATED, ...args)
  }

  /**
   * Gets called when the WebGL context has been restored. Re-triggers a render.
   * @private
   */
  _onContextRestored () {
    Log.warn(this.constructor.name, 'Trying to re-render after WebGL context has been restored.')
    this.setAllOperationsToDirty()
    this._operationsStack.forEach((operation) => {
      operation.disposeRenderTexture()
    })
    this.render()
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Exports the image
   * @param  {PhotoEditorSDK.RenderType} [renderType=PhotoEditorSDK.RenderType.DATAURL] - The output type
   * @param  {PhotoEditorSDK.ImageFormat} [imageFormat=PhotoEditorSDK.ImageFormat.PNG] - The output image format
   * @param  {Number} [quality=0.8] - The image quality, between 0 and 1
   * @return {Promise}
   */
  export (renderType = RenderType.DATAURL, imageFormat = ImageFormat.PNG, quality = 0.8) {
    this._renderMode = 'export'
    const tempDimensions = this._renderer.getDimensions()
    this._renderer.resizeTo(this.getFinalDimensions())

    return ImageExporter.validateSettings(renderType, imageFormat)
      .then(() => {
        return this.render()
      })
      .then(() => {
        return ImageExporter.export(
          this,
          this._image,
          this._renderer.getCanvas(),
          renderType,
          imageFormat,
          quality)
      })
      .then((data) => {
        this._renderer.resizeTo(tempDimensions)
        this._renderMode = 'dynamic'
        this.setAllOperationsToDirty()
        this.render()
        return data
      })
  }

  /**
   * Renders the current image
   * @return {Promise}
   */
  render () {
    let context = this._renderer.getContext()
    if (context.startFrame) context.startFrame()

    let perfTest
    if (PerformanceTest.canLog()) {
      perfTest = new PerformanceTest('⚡⚡⚡', 'Frame rendering')
    }
    Log.info('⚡⚡⚡', 'Rendering starts')

    this._sprite.setAnchor(0, 0)
    this._sprite.setPosition(0, 0)
    this._sprite.setScale(1, 1)
    this._sprite.setRotation(0)

    const stack = this._operationsStack
    stack.updateDirtinessForRenderer(this._renderer)

    this._sprite.setTexture(this._inputTexture)
    this._sprite.updateTransform()

    return stack.validateSettings()
      .then(() => {
        return stack.render(this, this._sprite)
      })
      .then(() => {
        if (this._renderMode === 'dynamic') {
          const position = this._renderer.getDimensions()
            .clone()
            .divide(2)
            .add(this._offset)
          this._sprite.setAnchor(0.5, 0.5)
          this._sprite.setScale(this._zoom, this._zoom)
          this._sprite.setPosition(position)
        }

        this._renderer.render(this._container)
      })
      .then(() => {
        perfTest && perfTest.stop()
        if (context.endFrame) context.endFrame()
      })
  }

  // -------------------------------------------------------------------------- OPERATIONS

  /**
   * Registers all default operations
   * @private
   */
  _registerOperations () {
    this._operations = {}

    for (let operationName in Operations) {
      const operation = Operations[operationName]
      this._operations[operation.identifier] = operation
    }

    this._operations = Utils.extend(this._operations,
      this._options.extensions.operations)
  }

  /**
   * Sets all operations in the stack to dirty
   */
  setAllOperationsToDirty () {
    this._operationsStack.setAllToDirty()
  }

  /**
   * Creates an operation with the given identifier
   * @param {String} identifier
   * @param {Object} options = {}
   * @param {Boolean} addToStack = true
   * @returns {Operation}
   */
  createOperation (identifier, options = {}, addToStack = true) {
    const Operation = this._operations[identifier]
    if (!Operation) {
      throw new Error(`No operation with identifier \`${identifier}\` found.`)
    }

    const operation = new Operation(this, options)
    if (addToStack) {
      this._operationsStack.push(operation)
    }
    return operation
  }

  /**
   * Adds the given operation to the operations stack
   * @param {Operation} operation
   */
  addOperation (operation) {
    this._operationsStack.push(operation)
  }

  // -------------------------------------------------------------------------- DIMENSIONS

  /**
   * Returns the maximum dimensions that this device supports (WebGL only)
   * @return {Number}
   */
  getMaxDimensions () {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      return null
    } else {
      return gl.getParameter(gl.MAX_TEXTURE_SIZE)
    }
  }

  /**
   * Returns the initial image dimensions
   * @return {Vector2}
   */
  getInputDimensions () {
    return new Vector2(this._image.width, this._image.height)
  }

  /**
   * Returns the final dimensions that the input image would have
   * after all existing operations have been applied
   * @return {Vector2}
   */
  getFinalDimensions () {
    let dimensions = this.getInputDimensions()
    const operationsStack = this._operationsStack

    operationsStack.forEach((operation) => {
      dimensions = operation.getNewDimensions(dimensions)
    })

    return dimensions
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Checks for version updates
   * @private
   */
  _checkForUpdates () {
    if (typeof window !== 'undefined' && this._options.versionCheck) {
      this._versionChecker = new VersionChecker(this.version)
    }
  }

  /**
   * Creates a render texture for the current renderer
   * @return {Engine.RenderTexture}
   * @TODO  This does probably not belong here
   */
  createRenderTexture () {
    const { pixelRatio } = this._options
    // @TODO Use Sprite#getFrame or Sprite#getWidth/#getHeight
    const bounds = this._sprite.getBounds()
    return new Engine.RenderTexture(this._renderer, bounds.width, bounds.height, pixelRatio)
  }

  /**
   * Initializes the renderer
   * @private
   */
  _initRenderer () {
    const rendererOptions = {
      canvas: this._options.canvas,
      pixelRatio: this._options.pixelRatio
    }

    let width, height
    if (this._renderMode === 'dynamic' && this._options.canvas) {
      const { canvas } = this._options
      width = canvas.width
      height = canvas.height
    } else if (this._image) {
      const dimensions = this.getFinalDimensions()
      width = dimensions.x
      height = dimensions.y
    }

    switch (this._preferredRenderer) {
      case 'webgl':
        this._renderer = new Engine.WebGLRenderer(width, height, rendererOptions)
        this._renderer.on('context-restored', this._onContextRestored)
        break
      default:
        console && console.error && console.error(`
          PhotoEditorSDK Error: Renderer \`${this._preferredRenderer}\` not supported.
          Falling back to automatically detected renderer.
        `)
        this._renderer = Engine.autoDetectRenderer(100, 100, rendererOptions)
    }
  }

  resizeTo (dimensions) {
    this._renderer.resizeTo(dimensions)
  }

  /**
   * Resets all custom and selected operations
   */
  reset () {
    this._operationsStack.clear()
  }

  // -------------------------------------------------------------------------- EXIF

  /**
   * Parses the exif data and fixes the orientation if necessary
   * @param {Image} image
   * @private
   * @TODO Move this somewhere else
   */
  _parseExif (image) {
    if (!image) return
    if (Exif.isJPEG(image.src)) {
      this._exif = null
      try {
        this._exif = Exif.fromBase64String(image.src)
      } catch (e) {}
      if (!this._exif) return

      this._handleExifOrientation()
    }
  }

  /**
   * Reads the EXIF orientation tag and fixes it with the OrientationOperation
   * @private
   * @TODO Move this somewhere else
   */
  _handleExifOrientation () {
    let exifTags = this._exif.getTags()

    if (exifTags && exifTags.Orientation) {
      const rotationNeedsChange = exifTags.Orientation !== 1 &&
        exifTags.Orientation !== 2
      const flipNeedsChange = [2, 4, 5, 7].indexOf(exifTags.Orientation) !== -1

      let orientationOperation
      if (rotationNeedsChange || flipNeedsChange) {
        orientationOperation = this.createOperation('orientation')
      }

      if (rotationNeedsChange) {
        // We need to rotate
        let degrees = 0
        switch (exifTags.Orientation) {
          case 7:
          case 8:
            degrees = -90
            break
          case 3:
          case 4:
            degrees = -180
            break
          case 5:
          case 6:
            degrees = 90
            break
        }

        orientationOperation.setRotation(degrees)
      }

      if ([2, 4].indexOf(exifTags.Orientation) !== -1) {
        orientationOperation.setFlipHorizontally(true)
      }

      if ([5, 7].indexOf(exifTags.Orientation) !== -1) {
        orientationOperation.setFlipVertically(true)
      }

      this._exif.setOrientation(1)
    }
  }

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  /**
   * Sets the image and parses the exif data
   * @param {Image} image
   * @param {Exif} exif = null
   */
  setImage (image, exif = null) {
    this._options.image = image
    this._image = image
    if (!exif) {
      this._parseExif(image)
    } else {
      this._exif = exif
      this._handleExifOrientation()
    }

    this._inputTexture = Engine.Texture.fromImage(this._image)
    this._sprite.setTexture(this._inputTexture)
  }

  setCanvas (canvas) { this._renderer.setCanvas(canvas) }
  getCanvas () { return this._renderer.getCanvas() }
  getSprite () { return this._sprite }
  getContainer () { return this._container }
  getOperationsStack () { return this._operationsStack }
  setOperationsStack (operationsStack) {
    if (this._operationsStack) {
      this._operationsStack.off(Events.OPERATION_UPDATED, this._onOperationUpdate)
    }

    this._operationsStack = operationsStack
    this._operationsStack.on(Events.OPERATION_UPDATED, this._onOperationUpdate)
  }
  getOperations () { return this._operations }
  getImage () { return this._image }
  hasImage () { return this._image !== null && typeof this._image !== 'undefined' }
  getRenderer () {
    if (!this._renderer) this._initRenderer()
    return this._renderer
  }
  getOffset () { return this._offset }
  setOffset (offset, y) {
    if (offset instanceof Vector2) {
      this._offset.copy(offset)
    } else {
      this._offset.set(offset, y)
    }
  }
  getZoom () { return this._zoom }
  setZoom (zoom) {
    this._zoom = zoom
    this._sprite.setScale(this._zoom, this._zoom)
  }
  getPixelRatio () { return this._options.pixelRatio }
}
