/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine, Vector2, Utils } from '../globals'
import Operation from './operation'
import StackBlur from '../vendor/stack-blur'
import Promise from '../vendor/promise'

class TiltShiftFilter extends Engine.Filter {
  constructor () {
    const fragmentSource = require('raw!../shaders/focus/tilt-shift.frag')
    const uniforms = Utils.extend(Engine.Shaders.TextureShader.defaultUniforms, {
      u_blurRadius: { type: 'f', value: 30 },
      u_gradientRadius: { type: 'f', value: 50 },
      u_start: { type: '2f', value: [0, 0.5] },
      u_end: { type: '2f', value: [1, 0.5] },
      u_delta: { type: '2f', value: [0, 0] },
      u_texSize: { type: '2f', value: [100, 100] }
    })
    super(null, fragmentSource, uniforms)
  }
}

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias PhotoEditorSDK.Operations.TiltShiftOperation
 * @extends PhotoEditorSDK.Operation
 */
class TiltShiftOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._lastBlurRadius = this._options.blurRadius
    this._lastGradientRadius = this._options.gradientRadius

    this._horizontalFilter = new TiltShiftFilter()
    this._verticalFilter = new TiltShiftFilter()
    this._sprite.setFilters([
      this._horizontalFilter,
      this._verticalFilter
    ])
  }

  /**
   * Crops this image using WebGL
   * @param  {PhotoEditorSDK} sdk
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    const renderer = sdk.getRenderer()
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)

    this._sprite.setTexture(outputSprite.getTexture())
    if (this.isDirtyForRenderer(renderer)) {
      const spriteBounds = outputSprite.getBounds()
      const outputDimensions = new Vector2(spriteBounds.width, spriteBounds.height)

      const start = this._options.start.clone()
      const end = this._options.end.clone()

      if (this._options.numberFormat === 'relative') {
        start.multiply(outputDimensions)
        end.multiply(outputDimensions)
      }

      // Calculate delta
      const delta = end.clone().subtract(start)
      const d = delta.len()

      const commonUniforms = {
        u_blurRadius: this._options.blurRadius,
        u_gradientRadius: this._options.gradientRadius,
        u_start: [start.x, start.y],
        u_end: [end.x, end.y],
        u_texSize: [outputDimensions.x, outputDimensions.y]
      }

      this._horizontalFilter.setUniforms(commonUniforms)
      this._verticalFilter.setUniforms(commonUniforms)

      this._horizontalFilter.setUniform('u_delta', [delta.x / d, delta.y / d])
      this._verticalFilter.setUniform('u_delta', [-delta.y / d, delta.x / d])

      renderTexture.render(this._container)
      this.setDirtyForRenderer(false, renderer)
    }

    outputSprite.setTexture(renderTexture)

    return Promise.resolve()
  }

  /**
   * Creates and/or returns the Filter
   * @return {TiltShiftFilter}
   * @private
   */
  _getFilter () {
    if (!this._filter) {
      this._filter = new TiltShiftFilter()
    }
    return this._filter
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @return {Promise}
   */
  _renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      const canvas = renderer.getCanvas()

      const optionsChanged = this._options.blurRadius !== this._lastBlurRadius ||
        this._options.gradientRadius !== this._lastGradientRadius
      let blurryCanvas
      if (optionsChanged || this._cachedBlurredCanvas === null) {
        // Blur and cache canvas
        blurryCanvas = this._blurCanvas(renderer)
        this._cachedBlurredCanvas = blurryCanvas
        this._lastBlurRadius = this._options.blurRadius
        this._lastGradientRadius = this._options.gradientRadius
      } else {
        // Use cached canvas
        blurryCanvas = this._cachedBlurredCanvas
      }

      const maskCanvas = this._createMask(renderer)
      this._applyMask(canvas, blurryCanvas, maskCanvas)

      resolve()
    })
  }

  /**
   * Creates a blurred copy of the canvas
   * @param  {CanvasRenderer} renderer
   * @return {Canvas}
   * @private
   */
  _blurCanvas (renderer) {
    var newCanvas = renderer.cloneCanvas()
    var blurryContext = newCanvas.getContext('2d')
    var blurryImageData = blurryContext.getImageData(0, 0, newCanvas.width, newCanvas.height)
    StackBlur.stackBlurCanvasRGBA(blurryImageData, 0, 0, newCanvas.width, newCanvas.height, this._options.blurRadius)
    blurryContext.putImageData(blurryImageData, 0, 0)

    return newCanvas
  }

  /**
   * Creates the mask canvas
   * @param  {CanvasRenderer} renderer
   * @return {Canvas}
   * @private
   */
  _createMask (renderer) {
    var canvas = renderer.getCanvas()

    var canvasSize = new Vector2(canvas.width, canvas.height)
    var gradientRadius = this._options.gradientRadius

    var maskCanvas = renderer.createCanvas(canvas.width, canvas.height)
    var maskContext = maskCanvas.getContext('2d')

    var start = this._options.start.clone()
    var end = this._options.end.clone()

    if (this._options.numberFormat === 'relative') {
      start.multiply(canvasSize)
      end.multiply(canvasSize)
    }

    let dist = end.clone().subtract(start)
    let middle = start.clone().add(dist.clone().divide(2))

    let totalDist = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2))
    let factor = dist.clone().divide(totalDist)

    let gradientStart = middle.clone()
      .add(gradientRadius * factor.y, -gradientRadius * factor.x)
    let gradientEnd = middle.clone()
      .add(-gradientRadius * factor.y, gradientRadius * factor.x)

    // Build gradient
    var gradient = maskContext.createLinearGradient(
      gradientStart.x, gradientStart.y,
      gradientEnd.x, gradientEnd.y
    )
    gradient.addColorStop(0, '#000000')
    gradient.addColorStop(0.5, '#FFFFFF')
    gradient.addColorStop(1, '#000000')

    // Draw gradient
    maskContext.fillStyle = gradient
    maskContext.fillRect(0, 0, canvas.width, canvas.height)

    return maskCanvas
  }

  /**
   * Applies the blur and mask to the input canvas
   * @param  {Canvas} inputCanvas
   * @param  {Canvas} blurryCanvas
   * @param  {Canvas} maskCanvas
   * @private
   */
  _applyMask (inputCanvas, blurryCanvas, maskCanvas) {
    var inputContext = inputCanvas.getContext('2d')
    var blurryContext = blurryCanvas.getContext('2d')
    var maskContext = maskCanvas.getContext('2d')

    var inputImageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height)
    var pixels = inputImageData.data
    var blurryPixels = blurryContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data
    var maskPixels = maskContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data

    for (let i = 0; i < maskPixels.length; i++) {
      let alpha = maskPixels[i] / 255
      pixels[i] = alpha * pixels[i] + (1 - alpha) * blurryPixels[i]
    }

    inputContext.putImageData(inputImageData, 0, 0)
  }

  /**
   * Sets the dirty state of this operation
   * @param {Boolean} dirty
   * @comment Since blur operations do seperate caching of the
   *          blurred canvas, we need to invalidate the cache when the
   *          dirty state changes.
   */
  set dirty (dirty) {
    super.dirty = dirty
    this._cachedBlurredCanvas = null
  }

  /**
   * Returns the dirty state
   * @type {Boolean}
   */
  get dirty () {
    return super.dirty
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
TiltShiftOperation.identifier = 'tilt-shift'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
TiltShiftOperation.prototype.availableOptions = {
  start: { type: 'vector2', default: new Vector2(0.0, 0.5) },
  end: { type: 'vector2', default: new Vector2(1.0, 0.5) },
  blurRadius: { type: 'number', default: 30 },
  gradientRadius: { type: 'number', default: 50 }
}

export default TiltShiftOperation
