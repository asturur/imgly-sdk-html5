/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Promise, Engine, Utils, Vector2 } from '../globals'
import Operation from './operation'

/**
 * An operation that can draw a watermark on top of the image
 * @class
 * @extends PhotoEditorSDK.Operation
 * @memberof PhotoEditorSDK.Operations
 */
class WatermarkOperation extends Operation {
  /**
   * Creates a new WatermarkOperation
   * @param  {PhotoEditorSDK} sdk
   * @param  {Object} [options]
   */
  constructor (...args) {
    super(...args)

    this._watermarkSprite = new Engine.Sprite()
    this._watermarkSprite.setAnchor(0.5, 0.5)
    this._container.addChild(this._watermarkSprite)
  }

  /**
   * Renders the watermark
   * @param  {PhotoEditorSDK} sdk
   * @private
   * @override
   */
  _render (sdk) {
    if (!this._watermarkTexture) {
      this._watermarkTexture = Engine.Texture.fromImage(this._options.image)
      this._watermarkSprite.setTexture(this._watermarkTexture)
    }

    const outputSprite = sdk.getSprite()
    const spriteBounds = outputSprite.getBounds()
    const spriteDimensions = new Vector2(spriteBounds.width, spriteBounds.height)
    const renderTexture = this._getRenderTexture(sdk)
    renderTexture.resizeTo(spriteDimensions)
    this._sprite.setTexture(outputSprite.getTexture())

    const { width, height } = this._options.image
    const dimensions = Utils.resizeVectorToFit(
      new Vector2(width, height),
      spriteDimensions
    )
    this._watermarkSprite.setPosition(
      spriteDimensions.x / 2,
      spriteDimensions.y / 2
    )
    this._watermarkSprite.setWidth(dimensions.x)
    this._watermarkSprite.setHeight(dimensions.y)

    renderTexture.render(this._container)

    outputSprite.setTexture(renderTexture)
    return Promise.resolve()
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 * @default
 */
WatermarkOperation.identifier = 'watermark'

/**
 * Specifies the available options for this operation
 * @type {Object}
 * @ignore
 */
WatermarkOperation.prototype.availableOptions = {
  image: { type: 'object', required: true }
}

export default WatermarkOperation
