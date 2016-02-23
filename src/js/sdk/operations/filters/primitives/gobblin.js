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
import Primitive from './primitive'

class GobblinFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../../shaders/primitives/gobblin.frag')
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

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        imageData.data[index + 2] = imageData.data[index + 1] * 0.33
        imageData.data[index] = imageData.data[index] * 0.6
        imageData.data[index + 2] += imageData.data[index] * 0.33
        imageData.data[index + 1] = imageData.data[index + 1] * 0.7
        imageData.data[index + 3] = 255
      }
    }

    outputContext.putImageData(imageData, 0, 0)
  }
}

/**
 * Gobblin primitive
 * @class
 * @extends PhotoEditorSDK.Filters.Primitive
 * @memberof PhotoEditorSDK.FilterPrimitives
 */
class Gobblin extends Primitive {
  constructor (...args) {
    super(...args)
    this._filter = new GobblinFilter()
  }
}

export default Gobblin
