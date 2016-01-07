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
    const fragmentSource = require('raw!../../../shaders/primitives/x400.frag')
    super(null, fragmentSource)
  }
}

/**
 * X400 primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.X400
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class X400 extends Primitive {
  /**
   * Returns the `Engine.Filter` for this Primitive
   * @return {Engine.Filter}
   */
  getFilter () {
    if (!this._filter) {
      this._filter = new X400Filter()
    }
    return this._filter
  }

  /**
   * Renders the primitive (Canvas)
   * @param  {CanvasRenderer} renderer
   * @param  {Canvas} canvas
   */
  renderCanvas (renderer, canvas) {
    const context = canvas.getContext('2d')
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height)

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

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }
}

export default X400
