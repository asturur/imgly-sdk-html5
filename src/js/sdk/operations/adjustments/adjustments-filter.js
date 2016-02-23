/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine } from '../../globals'

class AdjustmentsFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../shaders/generic/adjustments.frag')
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
    const canvas = inputTarget.getCanvas()
    const inputContext = inputTarget.getContext()
    const outputContext = outputTarget.getContext()

    const imageData = inputContext.getImageData(0, 0, canvas.width, canvas.height)

    let { brightness, saturation, contrast } = this._options

    const applyBrightness = brightness !== 0
    const applySaturation = saturation !== 1
    const applyContrast = contrast !== 1

    brightness = brightness * 255

    for (let i = 0; i < canvas.width * canvas.height; i++) {
      const index = i * 4
      let r = imageData.data[index]
      let g = imageData.data[index + 1]
      let b = imageData.data[index + 2]

      // Brightness
      if (applyBrightness) {
        r = r + brightness
        g = g + brightness
        b = b + brightness
      }

      // Saturation
      if (applySaturation) {
        const luminance = r * 0.2125 + g * 0.7154 + b * 0.0721
        r = luminance * (1 - saturation) + (r * saturation)
        g = luminance * (1 - saturation) + (g * saturation)
        b = luminance * (1 - saturation) + (b * saturation)
      }

      // Contrast
      if (applyContrast) {
        r = (r - 127) * contrast + 127
        g = (g - 127) * contrast + 127
        b = (b - 127) * contrast + 127
      }

      imageData.data[index] = r
      imageData.data[index + 1] = g
      imageData.data[index + 2] = b
    }

    outputContext.putImageData(imageData, 0, 0)
  }
}

AdjustmentsFilter.prototype.availableOptions = {
  brightness: { type: 'number', default: 0, uniformType: 'f' },
  saturation: { type: 'number', default: 1, uniformType: 'f' },
  contrast: { type: 'number', default: 1, uniformType: 'f' }
}

export default AdjustmentsFilter
