/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine, Utils, Vector2, Matrix } from '../globals'
import Operation from './operation'

class WatermarkOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._watermarkSprite = new Engine.Sprite()
    this._watermarkSprite.setAnchor(0.5, 0.5)
    this._container.addChild(this._watermarkSprite)
  }

  /**
   * Renders the watermark using Canvas2d
   * @param  {CanvasRenderer} renderer
   * @return {Promise}
   */
  _renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      const canvas = renderer.getCanvas()
      const context = renderer.getContext()
      const { image } = this._options

      const size = Utils.resizeVectorToFit(
        new Vector2(image.width, image.height),
        new Vector2(canvas.width, canvas.height)
      )

      const position = new Vector2(canvas.width, canvas.height)
        .divide(2)
        .subtract(size.clone()
          .divide(2))
      context.drawImage(
        image,
        position.x, position.y,
        size.x, size.y
      )

      resolve()
    })
  }

  /**
   * Renders the watermark using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    if (!this._watermarkTexture) {
      this._watermarkTexture = Engine.Texture.fromImage(this._options.image)
      this._watermarkSprite.setTexture(this._watermarkTexture)
    }

    const outputSprite = sdk.getSprite()
    const outputBounds = outputSprite.getBounds()
    const outputDimensions = new Vector2(outputBounds.width, outputBounds.height)
    const renderTexture = this._getRenderTexture(sdk)
    this._sprite.setTexture(outputSprite.getTexture())

    const { width, height } = this._options.image
    const dimensions = Utils.resizeVectorToFit(
      new Vector2(width, height),
      outputDimensions
    )
    this._watermarkSprite.setPosition(
      outputDimensions.x / 2,
      outputDimensions.y / 2
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
 */
WatermarkOperation.identifier = 'watermark'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
WatermarkOperation.prototype.availableOptions = {
  image: { type: 'object', required: true }
}

export default WatermarkOperation
