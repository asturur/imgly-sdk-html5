/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine, Vector2 } from '../../globals'
import Sprite from './sprite'

class AdjustmentsFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../shaders/generic/adjustments.frag')
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

    let { brightness, saturation, contrast } = this._options

    const applyBrightness = brightness !== 0
    const applySaturation = saturation !== 1
    const applyContrast = contrast !== 1

    brightness = brightness * 255

    for (let i = 0; i < canvas.width * canvas.height; i++) {
      const index = i * 4
      let r = imageData.data[index]
      let g = imageData.data[index + 1]
      let b = imageData.data[index + 2]

      // Brightness
      if (applyBrightness) {
        r = r + brightness
        g = g + brightness
        b = b + brightness
      }

      // Saturation
      if (applySaturation) {
        const luminance = r * 0.2125 + g * 0.7154 + b * 0.0721
        r = luminance * (1 - saturation) + (r * saturation)
        g = luminance * (1 - saturation) + (g * saturation)
        b = luminance * (1 - saturation) + (b * saturation)
      }

      // Contrast
      if (applyContrast) {
        r = (r - 127) * contrast + 127
        g = (g - 127) * contrast + 127
        b = (b - 127) * contrast + 127
      }

      imageData.data[index] = r
      imageData.data[index + 1] = g
      imageData.data[index + 2] = b
    }

    outputContext.putImageData(imageData, 0, 0)
  }
}

AdjustmentsFilter.prototype.availableOptions = {
  brightness: { type: 'number', default: 0, uniformType: 'f' },
  saturation: { type: 'number', default: 1, uniformType: 'f' },
  contrast: { type: 'number', default: 1, uniformType: 'f' }
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
      this._adjustmentsFilter.set({
        brightness: adjustments.getBrightness(),
        saturation: adjustments.getSaturation(),
        contrast: adjustments.getContrast()
      })

      const { width, height } = this._options.image
      renderTexture.resizeTo(new Vector2(width, height))
      renderTexture.clear()
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
