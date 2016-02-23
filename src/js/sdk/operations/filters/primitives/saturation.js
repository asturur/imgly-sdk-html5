/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Engine from '../../../engine/'
import Utils from '../../../lib/utils'
import Primitive from './primitive'

class SaturationFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../../shaders/primitives/saturation.frag')
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
    const { saturation } = this._options

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        var luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721
        imageData.data[index] = luminance * (1 - saturation) + (imageData.data[index] * saturation)
        imageData.data[index + 1] = luminance * (1 - saturation) + (imageData.data[index + 1] * saturation)
        imageData.data[index + 2] = luminance * (1 - saturation) + (imageData.data[index + 2] * saturation)
      }
    }

    outputContext.putImageData(imageData, 0, 0)
  }
}

SaturationFilter.prototype.availableOptions = {
  saturation: { type: 'number', default: 0, uniformType: 'f' }
}

/**
 * Saturation primitive
 * @class
 * @extends PhotoEditorSDK.Filters.Primitive
 * @memberof PhotoEditorSDK.FilterPrimitives
 */
class Saturation extends Primitive {
  constructor (...args) {
    super(...args)

    this._filter = new SaturationFilter()
    this._options = Utils.defaults(this._options, {
      saturation: 0
    })
  }

  /**
   * Updates the filter's uniforms
   */
  update () {
    this._filter.setSaturation(this._options.saturation)
  }
}

export default Saturation
