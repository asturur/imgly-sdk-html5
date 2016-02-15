/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2, Engine } from '../../globals'
import StackBlur from '../../vendor/stack-blur'

export default class TiltShiftFilter extends Engine.Filter {
  constructor (...args) {
    super(...args)
    this._fragmentSource = require('raw!../../shaders/focus/tilt-shift.frag')

    this._lastBlurRadius = null
    this._lastGradientRadius = null
    this._lastStart = new Vector2()
    this._lastEnd = new Vector2()

    this._blurredRenderTarget = new Engine.CanvasBuffer(
      100,
      100,
      1)

    this._maskRenderTarget = new Engine.CanvasBuffer(
      100,
      100,
      1)
  }

  /**
   * Applies this filter to the given inputTarget and renders it to
   * the given outputTarget using the CanvasRenderer
   * @param  {CanvasRenderer} renderer
   * @param  {RenderTarget} inputTarget
   * @param  {RenderTarget} outputTarget
   * @param  {Boolean} clear = false
   * @private
   */
  _applyCanvas (renderer, inputTarget, outputTarget, clear = false) {
    this._blurredRenderTarget.setPixelRatio(inputTarget.getPixelRatio())
    this._blurredRenderTarget.resizeTo(inputTarget.getDimensions())

    this._maskRenderTarget.setPixelRatio(inputTarget.getPixelRatio())
    this._maskRenderTarget.resizeTo(inputTarget.getDimensions())

    if (!this._outputRenderTexture) {
      this._outputRenderTexture = new Engine.RenderTexture(renderer,
        inputTarget.getWidth(),
        inputTarget.getHeight(),
        inputTarget.getPixelRatio())
    }

    if (!this._lastStart.equals(this._options.start) ||
        !this._lastEnd.equals(this._options.end) ||
        this._lastGradientRadius !== this._options.gradientRadius) {
      this._renderMask()

      this._lastStart = this._options.start.clone()
      this._lastEnd = this._options.end.clone()
      this._lastGradientRadius = this._options.gradientRadius
    }

    if (this._lastBlurRadius !== this._options.blurRadius) {
      this._blurImage(inputTarget)
      this._lastBlurRadius = this._options.blurRadius
    }

    this._applyMask(inputTarget, outputTarget)
  }

  /**
   * Creates a blurred copy of the image
   * @param  {CanvasBuffer} inputTarget
   * @return {Canvas}
   * @private
   */
  _blurImage (inputTarget) {
    const inputCanvas = inputTarget.getCanvas()
    const inputContext = inputTarget.getContext()

    const blurryImageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height)
    StackBlur.stackBlurCanvasRGBA(blurryImageData, 0, 0, inputCanvas.width, inputCanvas.height, this._options.blurRadius)

    const blurryContext = this._blurredRenderTarget.getContext()
    blurryContext.putImageData(blurryImageData, 0, 0)
  }

  /**
   * Renders the mask canvas
   * @private
   */
  _renderMask () {
    const canvas = this._maskRenderTarget.getCanvas()
    const context = this._maskRenderTarget.getContext()

    const canvasDimensions = new Vector2(canvas.width, canvas.height)

    const gradientRadius = this._options.gradientRadius
    const start = this._options.start.clone()
    const end = this._options.end.clone()

    start.multiply(canvasDimensions)
    end.multiply(canvasDimensions)

    const dist = end.clone().subtract(start)
    const middle = start.clone().add(dist.clone().divide(2))

    const totalDist = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2))
    const factor = dist.clone().divide(totalDist)

    const gradientStart = middle.clone()
      .add(gradientRadius * factor.y, -gradientRadius * factor.x)
    const gradientEnd = middle.clone()
      .add(-gradientRadius * factor.y, gradientRadius * factor.x)

    // Build gradient
    const gradient = context.createLinearGradient(
      gradientStart.x, gradientStart.y,
      gradientEnd.x, gradientEnd.y
    )
    gradient.addColorStop(0, '#000000')
    gradient.addColorStop(0.5, '#FFFFFF')
    gradient.addColorStop(1, '#000000')

    // Draw gradient
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * Applies the blur and mask to the input canvas
   * @param {CanvasBuffer} inputBuffer
   * @param {CanvasBuffer} outputBuffer
   * @private
   */
  _applyMask (inputBuffer, outputBuffer) {
    const outputContext = outputBuffer.getContext()
    const inputCanvas = inputBuffer.getCanvas()
    const inputContext = inputBuffer.getContext()
    const blurredContext = this._blurredRenderTarget.getContext()
    const maskContext = this._maskRenderTarget.getContext()

    const inputImageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height)
    const pixels = inputImageData.data
    const blurredPixels = blurredContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data
    const maskPixels = maskContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data

    let alpha
    for (let i = 0; i < inputCanvas.width * inputCanvas.height * 4; i += 4) {
      alpha = maskPixels[i] / 255

      pixels[i] = alpha * pixels[i] + (1 - alpha) * blurredPixels[i]
      pixels[i + 1] = alpha * pixels[i + 1] + (1 - alpha) * blurredPixels[i + 1]
      pixels[i + 2] = alpha * pixels[i + 2] + (1 - alpha) * blurredPixels[i + 2]
    }

    outputContext.putImageData(inputImageData, 0, 0)
  }
}

TiltShiftFilter.prototype.availableOptions = {
  blurRadius: { type: 'number', default: 30, uniformType: 'f' },
  gradientRadius: { type: 'number', default: 50, uniformType: 'f' },
  start: { type: 'vector2', default: new Vector2(0, 0.5), uniformType: '2f' },
  end: { type: 'vector2', default: new Vector2(1, 0.5), uniformType: '2f' },
  delta: { type: 'vector2', default: new Vector2(1, 1), uniformType: '2f' },
  texSize: { type: 'vector2', default: new Vector2(100, 100), uniformType: '2f' }
}
