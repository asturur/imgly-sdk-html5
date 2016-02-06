/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const TEXTURE_GL_UNIT = 3

import Engine from '../../../engine/'
import Utils from '../../../lib/utils'
import Primitive from './primitive'

class LookupTableFilter extends Engine.Filter {
  constructor () {
    const fragmentSource = require('raw!../../../shaders/primitives/lookup-table.frag')
    const uniforms = Utils.extend(Engine.Shaders.TextureShader.defaultUniforms, {
      u_lookupTable: {
        type: 'i',
        value: TEXTURE_GL_UNIT
      }
    })
    super(null, fragmentSource, uniforms)
  }
}

/**
 * Stores a 256 byte long lookup table in a 2d texture which will be
 * used to look up the corresponding value for each channel.
 * @class
 * @alias PhotoEditorSDK.Filter.Primitives.LookupTable
 * @extends {PhotoEditorSDK.Filter.Primitive}
 */
class LookupTable extends Primitive {
  constructor (...args) {
    super(...args)

    this._filter = new LookupTableFilter()
    this._textures = []
  }

  /**
   * Gets called before this primitive's filter is being applied
   */
  update (renderer) {
    this._updateTexture(renderer)
  }

  /**
   * Renders the primitive (Canvas)
   * @param  {CanvasRenderer} renderer
   * @param  {Canvas} canvas
   */
  renderCanvas (renderer, canvas) {
    const context = canvas.getContext('2d')
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    var table = this._options.data

    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        var index = (canvas.width * y + x) * 4

        var r = imageData.data[index]
        imageData.data[index] = table[r * 4]
        var g = imageData.data[index + 1]
        imageData.data[index + 1] = table[1 + g * 4]
        var b = imageData.data[index + 2]
        imageData.data[index + 2] = table[2 + b * 4]
      }
    }

    const outputContext = canvas.getContext('2d')
    outputContext.putImageData(imageData, 0, 0)
  }

  /**
   * Updates the lookup table texture (WebGL only)
   * @param {SDK} sdk
   * @private
   */
  /* istanbul ignore next */
  _updateTexture (sdk) {
    if (typeof this._options.data === 'undefined') {
      throw new Error('LookupTable: No data specified.')
    }

    const data = new Uint8Array(this._options.data)

    const renderer = sdk.getRenderer()
    const { id } = renderer
    if (!this._textures[id]) {
      this._textures[id] = new Engine.BaseTexture()
    }

    const texture = this._textures[id]
    texture.setSource(data)
    texture.setGLUnit(TEXTURE_GL_UNIT)

    renderer.updateTexture(texture)
  }
}

export default LookupTable
