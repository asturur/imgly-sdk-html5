/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Engine from './engine/'
import EventEmitter from './lib/event-emitter'
import Utils from './lib/utils'
import Vector2 from './lib/math/vector2'
import OperationsStack from './lib/operations-stack'
import VersionChecker from './lib/version-checker'
import Operations from './operations/'
import Exif from './lib/exif'
// import ImageDimensions from './image-dimensions'
// import ImageExporter from './image-exporter'
// import Vector2 from './math/vector2'

// import WebGLRenderer from '../renderers/webgl-renderer'
// import CanvasRenderer from '../renderers/canvas-renderer'
// import { RenderType, ImageFormat } from '../constants'

export default class Renderer extends EventEmitter {
  constructor (preferredRenderer, options = {}) {
    super()

    this._preferredRenderer = preferredRenderer
    this._options = Utils.defaults(options, {
      additionalOperations: {},
      renderMode: 'dynamic',
      versionCheck: true,
      image: null,
      dimensions: null,
      canvas: null,
      zoom: 1
    })

    this._offset = new Vector2()
    this._zoom = this._options.zoom
    this._operations = {}
    this._image = this._options.image
    this._operationsStack = null
    this.setOperationsStack(new OperationsStack())

    // Engine stuff
    this._container = new Engine.Container()
    this._sprite = new Engine.Sprite()
    this._container.addChild(this._sprite)

    this._inputBaseTexture = null
    this._inputTexture = null

    this._checkForUpdates()
    this._registerOperations()
  }

  render () {
    if (!this._renderer) this._initRenderer()

    this._sprite.setAnchor(0, 0)
    this._sprite.setPosition(0, 0)
    this._sprite.setScale(1, 1)

    const stack = this._operationsStack
    stack.updateDirtiness()

    if (!this._inputTexture) {
      this._inputTexture = Engine.Texture.fromImage(this._image)
    }
    this._sprite.setTexture(this._inputTexture)

    return stack.validateSettings()
      .then(() => {
        return stack.render(this, this._sprite)
      })
      .then(() => {
        const position = this._renderer.getDimensions()
          .clone()
          .divide(2)
          .add(this._offset)
        this._sprite.setAnchor(0.5, 0.5)
        this._sprite.setScale(this._zoom, this._zoom)
        this._sprite.setPosition(position)
        this._renderer.render(this._container)
      })
  }

  setAllOperationsToDirty () {
    this._operationsStack.setAllToDirty()
  }

  getInputDimensions () {
    return new Vector2(this._image.width, this._image.height)
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

  createRenderTexture () {
    const { pixelRatio } = this._options
    // @TODO Use Sprite#getFrame or Sprite#getWidth/#getHeight
    const bounds = this._sprite.getBounds()
    return new Engine.RenderTexture(this._renderer, bounds.width, bounds.height, pixelRatio)
  }

  _initRenderer () {
    const rendererOptions = {
      canvas: this._options.canvas,
      pixelRatio: (window && window.devicePixelRatio) || 1
    }

    let width, height
    if (this._options.renderMode === 'dynamic' && this._options.canvas) {
      const { canvas } = this._options
      width = canvas.width
      height = canvas.height
    } else if (this._image) {
      // @TODO Final dimensions go here
      width = this._image.width
      height = this._image.height
    }

    switch (this._preferredRenderer) {
      case 'webgl':
        this._renderer = new Engine.WebGLRenderer(width, height, rendererOptions)
        break
      default:
        console && console.error && console.error(`
          PhotoEditorSDK Error: Renderer \`${this._preferredRenderer}\` not supported.
          Falling back to automatically detected renderer.
        `)
        this._renderer = Engine.autoDetectRenderer(100, 100, rendererOptions)
    }
  }

  getSprite () { return this._sprite }

  /**
   * Resets all custom and selected operations
   */
  reset () {
    if (!this._renderer || !this._image) return
  }

  addOperation (operation) {
    this._operationsStack.push(operation)
  }

  setCanvas (canvas) {
    if (!this._renderer) this._initRenderer()

    this._renderer.setCanvas(canvas)
  }

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
    this.reset()
  }

  resizeTo (dimensions) {
    this._renderer.resizeTo(dimensions)
  }

  /**
   * Parses the exif data and fixes the orientation if necessary
   * @param {Image} image
   * @private
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
   * Checks for version updates
   * @private
   */
  _checkForUpdates () {
    if (typeof window !== 'undefined' && this._options.versionCheck) {
      const { version } = require('../../../package.json')
      this._versionChecker = new VersionChecker(version)
    }
  }

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
      this._options.additionalOperations)
  }

  /**
   * Gets called when an operation is updated. Delegates the event.
   * @private
   */
  _onOperationUpdate (...args) {
    this.emit('operation-update', ...args)
  }

  /**
   * Reads the EXIF orientation tag and fixes it with the OrientationOperation
   * @private
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

  getMaxDimensions () {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      return null
    } else {
      return gl.getParameter(gl.MAX_TEXTURE_SIZE)
    }
  }

  getOperationsStack () { return this._operationsStack }
  setOperationsStack (operationsStack) {
    if (this._operationsStack) {
      this._operationsStack.off('operation-update', this._onOperationUpdate)
    }

    this._operationsStack = operationsStack
    this._operationsStack.on('operation-update', this._onOperationUpdate)
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
}

// /**
//  * @class
//  * @param {String} preferredRenderer
//  * @param {Object} options = {}
//  * @param {Object} operationsOptions = {}
//  */
// export default class Renderer extends EventEmitter {
//   constructor (preferredRenderer, options = {}, operationsOptions = {}) {
//     super()
//     this._onRendererError = this._onRendererError.bind(this)
//     this._onOperationUpdate = this._onOperationUpdate.bind(this)
//
//     this._preferredRenderer = preferredRenderer
//
//     // Set default options
//     this._options = Utils.defaults(options, {
//       additionalOperations: {},
//       versionCheck: true,
//       image: null,
//       dimensions: null,
//       canvas: null
//     })
//
//     this._dimensions = this._options.dimensions && new ImageDimensions(this._options.dimensions)
//
//     this._image = this._options.image
//     this._operationsOptions = operationsOptions
//     this.setOperationsStack(new OperationsStack())
//
//     this._checkForUpdates()
//     this._registerOperations()
//   }
//
//
//
//   /**
//    * Renders the image
//    * @return {Promise}
//    */
//   render () {
//     if (!this._renderer) this._initRenderer()
//
//     const stack = this.operationsStack
//     stack.updateDirtiness()
//
//     this._renderer.preRender()
//     return stack.validateSettings()
//       .then(() => {
//         const dimensions = this.getOutputDimensions()
//         this._renderer.resizeTo(dimensions)
//       })
//       .then(() => {
//         return this._renderer.drawImage(this._image)
//       })
//       .then(() => {
//         return stack.render(this._renderer)
//       })
//       .then(() => {
//         return this._renderer.renderFinal()
//       })
//       .then(() => {
//         this._rendering = false
//       })
//   }
//
//   /**
//    * Exports the image
//    * @param  {PhotoEditorSDK.RenderType} [renderType=PhotoEditorSDK.RenderType.DATAURL] - The output type
//    * @param  {PhotoEditorSDK.ImageFormat} [imageFormat=PhotoEditorSDK.ImageFormat.PNG] - The output image format
//    * @param  {Number} [quality=0.8] - The image quality, between 0 and 1
//    * @return {Promise}
//    */
//   export (renderType = RenderType.DATAURL, imageFormat = ImageFormat.PNG, quality = 0.8) {
//     return ImageExporter.validateSettings(renderType, imageFormat)
//       .then(() => {
//         return this.render()
//       })
//       .then(() => {
//         return ImageExporter.export(
//           this,
//           this._image,
//           this._renderer.getCanvas(),
//           renderType,
//           imageFormat,
//           quality)
//       })
//   }
//
//
//   /**
//    * Returns the current image
//    * @return {Image}
//    */
//   getImage () {
//     return this._image
//   }
//
//
//
//
//
//   /**
//    * Sets all operations to dirty
//    */
//   setAllOperationsToDirty () {
//     this.operationsStack.setAllToDirty()
//   }
//
//   /**
//    * Gets called when the renderer emits an error
//    * @param  {Error} e
//    * @private
//    */
//   _onRendererError (e) {
//     this.emit('error', e)
//   }
//
//   /**
//    * Creates a renderer (canvas or webgl, depending on support)
//    * @return {Promise}
//    * @private
//    */
//   _initRenderer () {
//     /* istanbul ignore if */
//     if (WebGLRenderer.isSupported() && this._preferredRenderer !== 'canvas') {
//       this._renderer = new WebGLRenderer(this._options.canvas, this._image)
//       this._webglEnabled = true
//     } else if (CanvasRenderer.isSupported()) {
//       this._renderer = new CanvasRenderer(this._options.canvas, this._image)
//       this._webglEnabled = false
//     }
//
//     /* istanbul ignore if */
//     if (this._renderer === null) {
//       throw new Error('Neither Canvas nor WebGL renderer are supported.')
//     }
//
//     this._renderer.on('error', this._onRendererError)
//   }
//
//   /**
//    * Returns the output dimensions for the current stack
//    * @return {Vector2}
//    */
//   getOutputDimensions () {
//     const stack = this.operationsStack
//
//     let dimensions = this._renderer.getOutputDimensionsForStack(stack)
//     if (this._dimensions && this._dimensions.bothSidesGiven()) {
//       dimensions = Utils.resizeVectorToFit(dimensions, this._dimensions.toVector())
//     }
//     dimensions.floor()
//
//     return dimensions
//   }
//
//   /**
//    * Returns the initial dimensions for the current stack
//    * @return {Vector2}
//    */
//   getInitialDimensions () {
//     if (!this._renderer) this._initRenderer()
//
//     const stack = this.operationsStack
//     return this._renderer.getInitialDimensionsForStack(stack)
//   }
//
//   getInputDimensions () {
//     return new Vector2(this._image.width, this._image.height)
//   }
//
//
//   setOperationsStack (operationsStack) {
//     if (this.operationsStack) {
//       this.operationsStack.off('operation-update', this._onOperationUpdate)
//     }
//
//     this.operationsStack = operationsStack
//     this.operationsStack.on('operation-update', this._onOperationUpdate)
//   }
//
//   clone () {
//     const renderer = new Renderer(
//       this._preferredRenderer,
//       this._options,
//       this._operationsOptions)
//     renderer.operationsStack = renderer.operationsStack
//     renderer.setCanvas(null) // Let it create its own canvas
//     return renderer
//   }
//
//   getExif () { return this._exif }
//   setCanvas (canvas) {
//     this._options.canvas = canvas
//     this.reset()
//   }
//   getRenderer () {
//     return this._renderer
//   }
//   hasImage () { return !!this._options.image }
//   getOperations () { return this._operations }
//   getOptions () { return this._options }
//   getOperationsOptions () { return this._operationsOptions }
//
//   getDimensions () {
//     return this._dimensions
//   }
//
//
//   setDimensions (dimensions) {
//     if (!dimensions) {
//       const initialDimensions = this.getInitialDimensions().clone().round()
//       dimensions = `${initialDimensions.x}x${initialDimensions.y}`
//     } else if (dimensions instanceof ImageDimensions) {
//       this._dimensions = dimensions
//       return
//     }
//     this._dimensions = new ImageDimensions(dimensions)
//   }
// }
