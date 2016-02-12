/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Engine from '../../../engine/'
import Utils from '../../../lib/utils'
import Primitive from './primitive'

class DesaturationFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../../shaders/primitives/desaturation.frag')
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

    const { desaturation } = this._options

    for (let i = 0; i < canvas.width * canvas.height; i++) {
      const index = i * 4
      var luminance = imageData.data[index] * 0.3 + imageData.data[index + 1] * 0.59 + imageData.data[index + 2] * 0.11
      imageData.data[index] = luminance * (1 - desaturation) + (imageData.data[index] * desaturation)
      imageData.data[index + 1] = luminance * (1 - desaturation) + (imageData.data[index + 1] * desaturation)
      imageData.data[index + 2] = luminance * (1 - desaturation) + (imageData.data[index + 2] * desaturation)
    }

    outputContext.putImageData(imageData, 0, 0)
  }
}

DesaturationFilter.prototype.availableOptions = {
  desaturation: { type: 'number', default: 1, uniformType: 'f' }
}

/**
 * Desaturation primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.Desaturation
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class Desaturation extends Primitive {
  constructor (...args) {
    super(...args)

    this._filter = new DesaturationFilter()
    this._options = Utils.defaults(this._options, {
      desaturation: 1
    })
  }

  /**
   * Updates the filter's uniforms
   */
  update () {
    this._filter.setDesaturation(this._options.desaturation)
  }
}

export default Desaturation
