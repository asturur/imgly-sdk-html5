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
import Color from '../../../lib/color'

class SoftColorOverlayFilter extends Engine.Filter {
  constructor () {
    const fragmentSource = require('raw!../../../shaders/primitives/soft-color-overlay.frag')
    const uniforms = Utils.extend(Engine.Shaders.TextureShader.defaultUniforms, {
      u_overlay: {
        type: '3f',
        value: [1, 1, 1, 1]
      }
    })
    super(null, fragmentSource, uniforms)
  }
}

/**
 * SoftColorOverlay primitive
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.SoftColorOverlay
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class SoftColorOverlay extends Primitive {
  constructor (...args) {
    super(...args)

    this._options = Utils.defaults(this._options, {
      color: new Color(1.0, 1.0, 1.0)
    })
  }

  /**
   * Returns the `Engine.Filter` for this Primitive
   * @return {Engine.Filter}
   */
  getFilter () {
    if (!this._filter) {
      this._filter = new SoftColorOverlayFilter()
    }
    this._filter.setUniform('u_overlay', this._options.color.toRGBGLColor())
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

        imageData.data[index] = Math.max(this._options.color.r, imageData.data[index])
        imageData.data[index + 1] = Math.max(this._options.color.g, imageData.data[index + 1])
        imageData.data[index + 2] = Math.max(this._options.color.b, imageData.data[index + 2])
      }
    }

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }
}

export default SoftColorOverlay
