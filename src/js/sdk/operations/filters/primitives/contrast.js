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

class ContrastFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../../shaders/primitives/contrast.frag')
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

    let { contrast } = this._options
    if (contrast === 1) return

    for (let i = 0; i < canvas.width * canvas.height; i++) {
      const index = i * 4
      imageData.data[index] = (imageData.data[index] - 127) * contrast + 127
      imageData.data[index + 1] = (imageData.data[index + 1] - 127) * contrast + 127
      imageData.data[index + 2] = (imageData.data[index + 2] - 127) * contrast + 127
    }

    outputContext.putImageData(imageData, 0, 0)
  }
}

ContrastFilter.prototype.availableOptions = {
  contrast: { type: 'number', default: 1, uniformType: 'f' }
}

/**
 * Contrast primitive
 * @class
 * @extends PhotoEditorSDK.Filters.Primitive
 * @memberof PhotoEditorSDK.FilterPrimitives
 */
class Contrast extends Primitive {
  constructor (...args) {
    super(...args)

    this._filter = new ContrastFilter()
    this._options = Utils.defaults(this._options, {
      contrast: 1.0
    })
  }

  /**
   * Updates the filter's uniforms
   */
  update () {
    this._filter.setContrast(this._options.contrast)
  }
}

export default Contrast
