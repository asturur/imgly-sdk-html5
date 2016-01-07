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

class GrayscaleFilter extends Engine.Filter {
  constructor () {
    const fragmentSource = require('raw!../../../shaders/primitives/grayscale.frag')
    super(null, fragmentSource)
  }
}

/**
 * Grayscale primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.Grayscale
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class Grayscale extends Primitive {
  /**
   * Returns the `Engine.Filter` for this Primitive
   * @return {Engine.Filter}
   */
  getFilter () {
    if (!this._filter) {
      this._filter = new GrayscaleFilter()
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

        var luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721

        imageData.data[index] = luminance
        imageData.data[index + 1] = luminance
        imageData.data[index + 2] = luminance
      }
    }

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }
}

export default Grayscale
