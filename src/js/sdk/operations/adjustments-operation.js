/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2 } from '../globals'
import Promise from '../vendor/promise'
import Operation from './operation'
import AdjustmentsFilter from './adjustments/adjustments-filter'

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
   * Applies this operation
   * @param  {PhotoEditorSDK} sdk
   * @return {Promise} renderer
   * @private
   */
  _render (sdk) {
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)
    const renderer = sdk.getRenderer()

    this._sprite.setTexture(outputSprite.getTexture())

    const spriteBounds = outputSprite.getBounds()
    const spriteDimensions = new Vector2(spriteBounds.width, spriteBounds.height)
    renderTexture.resizeTo(spriteDimensions)

    this._filter.set({
      brightness: this._options.brightness,
      saturation: this._options.saturation,
      contrast: this._options.contrast
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
