/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
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
    super()
    this._fragmentSource = require('raw!../../../shaders/primitives/glow.frag')
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

    const { color } = this._options

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

    outputContext.putImageData(imageData, 0, 0)
  }
}

/**
 * Specifies the available options for this filter
 * @type {Object}
 * @ignore
 */
GlowFilter.prototype.availableOptions = {
  color: { type: 'color', default: Color.WHITE, uniformType: '3f' }
}

/**
 * Glow primitive
 * @class
 * @extends PhotoEditorSDK.Filters.Primitive
 * @memberof PhotoEditorSDK.FilterPrimitives
 */
class Glow extends Primitive {
  constructor (...args) {
    super(...args)

    this._filter = new GlowFilter()
  }

  /**
   * Updates the filter's uniforms
   */
  update () {
    this._filter.setColor(this._options.color)
  }
}

/**
 * Specifies the available options for this primitive
 * @type {Object}
 * @ignore
 */
Glow.prototype.availableOptions = GlowFilter.prototype.availableOptions

export default Glow
