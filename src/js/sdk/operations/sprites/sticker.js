/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine, Vector2, Utils } from '../../globals'
import Sprite from './sprite'

class AdjustmentsFilter extends Engine.Filter {
  constructor (...args) {
    const fragmentSource = require('raw!../../shaders/generic/adjustments.frag')
    const uniforms = Utils.extend(Engine.Shaders.TextureShader.defaultUniforms, {
      u_brightness: { type: 'f', value: 0 },
      u_saturation: { type: 'f', value: 1 },
      u_contrast: { type: 'f', value: 1 }
    })
    super(null, fragmentSource, uniforms)
  }
}

export default class Sticker extends Sprite {
  constructor (...args) {
    super(...args)

    if (this._options.image) {
      this._onImageUpdate()
    }

    this._renderTextures = {}
    this._adjustmentsFilter = new AdjustmentsFilter()
  }

  /**
   * Updates this sprite
   * @param  {PhotoEditorSDK} sdk
   * @returns {Promise}
   */
  update (sdk) {
    super.update(sdk)

    const renderer = sdk.getRenderer()

    const renderTexture = this._getRenderTexture(renderer)
    const hasAdjustments = this._hasAdjustments()

    // Stickers with adjustments are rendered to a render texture that
    // can be re-used
    if (hasAdjustments) {
      this._identitySprite.setTexture(this._inputTexture)
      this._identitySprite.setFilters(hasAdjustments ? [this._adjustmentsFilter] : [])

      const adjustments = this._options.adjustments
      this._adjustmentsFilter.setUniforms({
        u_brightness: adjustments.getBrightness(),
        u_saturation: adjustments.getSaturation(),
        u_contrast: adjustments.getContrast()
      }, true)

      const { width, height } = this._options.image
      renderTexture.resizeTo(new Vector2(width, height))
      renderTexture.render(this._identitySprite)
      this._sprite.setTexture(renderTexture)
    } else {
      this._sprite.setTexture(this._inputTexture)
    }

    // Flip
    const scale = this._sprite.getScale()
    if (this._options.flipVertically) {
      scale.y *= -1
    }
    if (this._options.flipHorizontally) {
      scale.x *= -1
    }
    this._sprite.setScale(scale)

    return Promise.resolve()
  }

  /**
   * Creates and/or returns a RenderTexture
   * @param {Engine.BaseRenderer} renderer
   * @return {Engine.RenderTexture}
   */
  _getRenderTexture (renderer) {
    if (!this._renderTextures[renderer.id]) {
      const { width, height } = this._options.image
      this._renderTextures[renderer.id] =
        new Engine.RenderTexture(renderer, width, height, 1)
    }
    return this._renderTextures[renderer.id]
  }

  /**
   * Checks if this sticker has any adjustments and a filter is needed
   * @return {Boolean}
   * @private
   */
  _hasAdjustments () {
    const adjustments = this._options.adjustments
    return adjustments.getBrightness() !== 0 ||
      adjustments.getSaturation() !== 1 ||
      adjustments.getContrast() !== 1
  }

  /**
   * Gets called when this sticker's image is updated
   * @private
   */
  _onImageUpdate () {
    this._inputTexture = Engine.Texture.fromImage(this._options.image)
    this._identitySprite.setTexture(this._inputTexture)
    this._sprite.setTexture(this._inputTexture)
    this.setDirty(true)
  }
}

Sticker.prototype.availableOptions = {
  image: { type: 'object', required: true },
  position: { type: 'vector2', default: new Vector2(0.5, 0.5) },
  scale: { type: 'vector2', default: new Vector2(1.0, 1.0) },
  anchor: { type: 'vector2', default: new Vector2(0.0, 0.0) },
  pivot: { type: 'vector2', default: new Vector2(0.5, 0.5) },
  rotation: { type: 'number', default: 0 },
  flipHorizontally: { type: 'boolean', default: false },
  flipVertically: { type: 'boolean', default: false },
  adjustments: { type: 'configurable', structure: {
    brightness: { type: 'number', default: 0 },
    saturation: { type: 'number', default: 1 },
    contrast: { type: 'number', default: 1 }
  }}
}
