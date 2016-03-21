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
import Primitive from './primitive'
import Color from '../../../lib/color'

class SoftColorOverlayFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../../shaders/primitives/soft-color-overlay.frag')
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

        imageData.data[index] = Math.max(this._options.color.r * 255, imageData.data[index])
        imageData.data[index + 1] = Math.max(this._options.color.g * 255, imageData.data[index + 1])
        imageData.data[index + 2] = Math.max(this._options.color.b * 255, imageData.data[index + 2])
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
SoftColorOverlayFilter.prototype.availableOptions = {
  color: { type: 'color', default: Color.WHITE, uniformType: '3f' }
}

/**
 * SoftColorOverlay primitive
 * @class
 * @extends PhotoEditorSDK.Filters.Primitive
 * @memberof PhotoEditorSDK.FilterPrimitives
 */
class SoftColorOverlay extends Primitive {
  constructor (...args) {
    super(...args)

    this._filter = new SoftColorOverlayFilter()
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
SoftColorOverlay.prototype.availableOptions = SoftColorOverlayFilter.prototype.availableOptions

export default SoftColorOverlay
