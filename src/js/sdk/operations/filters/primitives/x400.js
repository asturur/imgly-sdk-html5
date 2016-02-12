/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Engine from '../../../engine'
import Primitive from './primitive'

class X400Filter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../../shaders/primitives/x400.frag')
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

        var gray = imageData.data[index] / 255 * 0.3 + imageData.data[index + 1] / 255 * 0.3 + imageData.data[index + 2] / 255 * 0.3
        gray -= 0.2
        gray = Math.max(0.0, Math.min(1.0, gray))
        gray += 0.15
        gray *= 1.4

        gray *= 255
        imageData.data[index] = gray
        imageData.data[index + 1] = gray
        imageData.data[index + 2] = gray
      }
    }

    outputContext.putImageData(imageData, 0, 0)
  }
}

/**
 * X400 primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.X400
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class X400 extends Primitive {
  constructor (...args) {
    super(...args)
    this._filter = new X400Filter()
  }
}

export default X400
