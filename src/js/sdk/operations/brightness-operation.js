/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from './operation'
import PrimitivesStack from './filters/primitives-stack'
import BrightnessPrimitive from './filters/primitives/brightness'

/**
 * @class
 * @alias PhotoEditorSDK.Operations.BrightnessOperation
 * @extends PhotoEditorSDK.Operation
 */
class BrightnessOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._stack = new PrimitivesStack()
    this._primitive = new BrightnessPrimitive({
      brightness: this._options.brightness
    })
    this._stack.add(this._primitive)
  }
  /**
   * Renders the brightness using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @override
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    return this._render(sdk)
  }

  /**
   * Renders the brightness using Canvas2D
   * @param {PhotoEditorSDK} sdk
   * @override
   */
  _renderCanvas (sdk) {
    return this._render(sdk)
  }

  /**
   * Renders the brightness (all renderers supported)
   * @param {PhotoEditorSDK} sdk
   * @private
   */
  _render (sdk) {
    this._primitive.options.brightness = this._options.brightness
    this._stack.setDirty(true)
    return this._stack.render(sdk, this._getRenderTexture(sdk))
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
BrightnessOperation.identifier = 'brightness'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
BrightnessOperation.prototype.availableOptions = {
  brightness: { type: 'number', default: 0 }
}

export default BrightnessOperation
