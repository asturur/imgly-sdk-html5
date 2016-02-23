/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine } from '../../../globals'
import Utils from '../../../lib/utils'
import Primitive from './primitive'

class BrightnessFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../../shaders/primitives/brightness.frag')
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

    let { brightness } = this._options

    if (brightness === 0) return
    brightness = brightness * 255

    for (let i = 0; i < canvas.width * canvas.height; i++) {
      const index = i * 4
      imageData.data[index] += brightness
      imageData.data[index + 1] += brightness
      imageData.data[index + 2] += brightness
    }

    outputContext.putImageData(imageData, 0, 0)
  }
}

BrightnessFilter.prototype.availableOptions = {
  brightness: { type: 'number', default: 0, uniformType: 'f' }
}

/**
 * Brightness primitive
 * @class
 * @extends PhotoEditorSDK.Filters.Primitive
 * @memberof PhotoEditorSDK.FilterPrimitives
 */
class Brightness extends Primitive {
  constructor (...args) {
    super(...args)

    this._filter = new BrightnessFilter()
    this._options = Utils.defaults(this._options, {
      brightness: 1.0
    })
  }

  /**
   * Updates the filter's uniforms
   */
  update () {
    this._filter.setBrightness(this._options.brightness)
  }
}

export default Brightness
