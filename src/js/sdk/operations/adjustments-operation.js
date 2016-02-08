/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Utils, Engine, Vector2 } from '../globals'
import Promise from '../vendor/promise'
import Operation from './operation'

// @TODO Move this to a separate file, `Sticker` uses it as well
class AdjustmentsFilter extends Engine.Filter {
  constructor (...args) {
    const fragmentSource = require('raw!../shaders/generic/adjustments.frag')
    const uniforms = Utils.extend(Engine.Shaders.TextureShader.defaultUniforms, {
      u_brightness: { type: 'f', value: 0 },
      u_saturation: { type: 'f', value: 1 },
      u_contrast: { type: 'f', value: 1 }
    })
    super(null, fragmentSource, uniforms)
  }
}

/**
 * @class
 * @alias PhotoEditorSDK.Operations.AdjustmentsOperation
 * @extends PhotoEditorSDK.Operation
 */
class AdjustmentsOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._filter = new AdjustmentsFilter()
    this._sprite.setFilters([this._filter])
  }

  /**
   * Applies this operation using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @return {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)
    const renderer = sdk.getRenderer()

    this._sprite.setTexture(outputSprite.getTexture())

    const spriteBounds = outputSprite.getBounds()
    const spriteDimensions = new Vector2(spriteBounds.width, spriteBounds.height)
    renderTexture.resizeTo(spriteDimensions)

    this._filter.setUniforms({
      u_brightness: this._options.brightness,
      u_saturation: this._options.saturation,
      u_contrast: this._options.contrast
    })

    renderTexture.render(this._container)
    outputSprite.setTexture(renderTexture)

    this.setDirtyForRenderer(false, renderer)

    return Promise.resolve()
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
AdjustmentsOperation.identifier = 'adjustments'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
AdjustmentsOperation.prototype.availableOptions = {
  brightness: { type: 'number', default: 0 },
  saturation: { type: 'number', default: 1.0 },
  contrast: { type: 'number', default: 1.0 }
}

export default AdjustmentsOperation
