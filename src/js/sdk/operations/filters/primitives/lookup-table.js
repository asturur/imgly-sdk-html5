/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const TEXTURE_GL_UNIT = 3

import Engine from '../../../engine/'
import Primitive from './primitive'

class LookupTableFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../../shaders/primitives/lookup-table.frag')
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

    const table = this._options.lookupTableData
    for (let i = 0; i < canvas.width * canvas.height; i++) {
      const index = i * 4

      var r = imageData.data[index]
      imageData.data[index] = table[r * 4]
      var g = imageData.data[index + 1]
      imageData.data[index + 1] = table[1 + g * 4]
      var b = imageData.data[index + 2]
      imageData.data[index + 2] = table[2 + b * 4]
    }

    outputContext.putImageData(imageData, 0, 0)
  }
}

/**
 * Specifies the available options for this filter
 * @type {Object}
 * @ignore
 */
LookupTableFilter.prototype.availableOptions = {
  lookupTable: { type: 'number', default: TEXTURE_GL_UNIT, uniformType: 'i' },
  lookupTableData: { type: 'array', default: [] }
}

/**
 * Stores a 256 byte long lookup table in a 2d texture which will be
 * used to look up the corresponding value for each channel.
 * @class
 * @extends PhotoEditorSDK.Filters.Primitive
 * @memberof PhotoEditorSDK.FilterPrimitives
 */
class LookupTable extends Primitive {
  constructor (...args) {
    super(...args)

    this._filter = new LookupTableFilter()
    this._textures = []
  }

  /**
   * Gets called before this primitive's filter is being applied
   * @param {PhotoEditorSDK} sdk
   */
  update (sdk) {
    const renderer = sdk.getRenderer()
    /* istanbul ignore if */
    if (renderer.isOfType('webgl')) {
      this._updateWebGLTexture(sdk)
    } else if (renderer.isOfType('canvas')) {
      this._filter.setLookupTableData(this._options.data)
    }
  }

  /**
   * Updates the lookup table texture (WebGL only)
   * @param {PhotoEditorSDK} sdk
   * @private
   */
  /* istanbul ignore next */
  _updateWebGLTexture (sdk) {
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

    /* istanbul ignore next */
    if (renderer.isOfType('webgl')) {
      renderer.updateTexture(texture)
    }
  }

  /**
   * Cleans up this primitive
   */
  dispose () {
    super.dispose()
    for (let id in this._textures) {
      delete this._textures[id]
    }
    delete this._options.data
  }
}

export default LookupTable
