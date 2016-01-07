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

class BrightnessFilter extends Engine.Filter {
  constructor () {
    const fragmentSource = require('raw!../../../shaders/primitives/brightness.frag')
    const uniforms = Utils.extend(Engine.Shaders.TextureShader.defaultUniforms, {
      u_brightness: {
        type: 'f',
        value: 1.0
      }
    })
    super(null, fragmentSource, uniforms)
  }
}

/**
 * Brightness primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.Brightness
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class Brightness extends Primitive {
  constructor (...args) {
    super(...args)

    this._options = Utils.defaults(this._options, {
      brightness: 1.0
    })
  }

  /**
   * Returns the `Engine.Filter` for this Primitive
   * @return {Engine.Filter}
   */
  getFilter () {
    if (!this._filter) {
      this._filter = new BrightnessFilter()
    }
    this._filter.setUniform('u_brightness', this._options.brightness)
    return this._filter
  }

  /**
   * Renders the primitive (Canvas)
   * @param  {CanvasRenderer} renderer
   * @param  {Canvas} canvas
   */
  renderCanvas (renderer, canvas) {
    var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
    var brightness = this._options.brightness

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        imageData.data[index] = imageData.data[index] + brightness * 255
        imageData.data[index + 1] = imageData.data[index + 1] + brightness * 255
        imageData.data[index + 2] = imageData.data[index + 2] + brightness * 255
      }
    }

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }
}

export default Brightness
