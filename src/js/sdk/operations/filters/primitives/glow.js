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
import Utils from '../../../lib/utils'
import Primitive from './primitive'
import Color from '../../../lib/color'

class GlowFilter extends Engine.Filter {
  constructor () {
    const fragmentSource = require('raw!../../../shaders/primitives/glow.frag')
    const uniforms = Utils.extend(Engine.Shaders.TextureShader.defaultUniforms, {
      u_color: {
        type: '3f',
        value: [1, 1, 1, 1]
      }
    })
    super(null, fragmentSource, uniforms)
  }
}

/**
 * Glow primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.Glow
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class Glow extends Primitive {
  constructor (...args) {
    super(...args)

    this._filter = new GlowFilter()
    this._options = Utils.defaults(this._options, {
      color: new Color(1, 1, 1)
    })
  }

  /**
   * Updates the filter's uniforms
   */
  update () {
    this._filter.setUniform('u_color', this._options.color.toRGBGLColor())
  }

  /**
   * Renders the primitive (Canvas)
   * @param  {CanvasRenderer} renderer
   * @param  {Canvas} canvas
   */
  renderCanvas (renderer, canvas) {
    const context = canvas.getContext('2d')
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    var color = this._options.color

    var d
    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        var x01 = x / canvas.width
        var y01 = y / canvas.height

        var nx = (x01 - 0.5) / 0.75
        var ny = (y01 - 0.5) / 0.75

        var scalarX = nx * nx
        var scalarY = ny * ny
        d = 1 - (scalarX + scalarY)
        d = Math.min(Math.max(d, 0.1), 1.0)

        imageData.data[index] = imageData.data[index] * (d * color.r)
        imageData.data[index + 1] = imageData.data[index + 1] * (d * color.g)
        imageData.data[index + 2] = imageData.data[index + 2] * (d * color.b)
        imageData.data[index + 3] = 255
      }
    }

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }
}

export default Glow
