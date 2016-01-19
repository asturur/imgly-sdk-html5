/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Color, Vector2 } from '../../globals'
import Sprite from './sprite'
import TextRenderer from './text/text-renderer'

export default class Text extends Sprite {
  constructor (...args) {
    super(...args)

    this._textRenderer = new TextRenderer(this, this._operation)
    this._sprite.setTexture(this._textRenderer.getTexture())
  }

  /**
   * Returns a style object for this text
   * @param {PhotoEditorSDK} SDK
   * @param {Vector2} outputDimensions
   * @return {Object}
   */
  getDOMStyle (sdk, outputDimensions) {
    const textOptions = this._textRenderer.calculateFontStyles(sdk, true)

    return {
      fontWeight: this._options.fontWeight,
      fontSize: textOptions.fontSize,
      fontFamily: this._options.fontFamily,
      lineHeight: textOptions.lineHeight + 'px',
      color: this._options.color.toRGBA(),
      backgroundColor: this._options.backgroundColor.toRGBA(),
      textAlign: this._options.alignment
    }
  }

  /**
   * Returns the bounding box for this text
   * @param  {PhotoEditorSDK} sdk
   * @param  {Boolean} considerZoom = false
   * @return {Vector2}
   */
  getBoundingBox (sdk, considerZoom = false) {
    return this._textRenderer.getBoundingBox(sdk, considerZoom)
  }

  /**
   * Updates this sprite
   * @param  {SDK} sdk
   * @return {Promise}
   */
  update (sdk) {
    const renderer = sdk.getRenderer()
    if (this.isDirtyForRenderer(renderer)) {
      this._textRenderer.update(sdk)

      const textTexture = this._textRenderer.getTexture()
      const baseTexture = textTexture.getBaseTexture()
      baseTexture.update()
      renderer.updateTexture(textTexture.getBaseTexture())

      this.setDirtyForRenderer(false, renderer)
    }

    return super.update(sdk)
  }
}

Sprite.prototype.availableOptions = {
  fontSize: { type: 'number', default: 0.1 },
  lineHeight: { type: 'number', default: 1.1 },
  fontFamily: { type: 'string', default: 'Times New Roman' },
  fontWeight: { type: 'string', default: 'normal' },
  alignment: { type: 'string', default: 'left', available: ['left', 'center', 'right'] },
  verticalAlignment: { type: 'string', default: 'top', available: ['top', 'center', 'bottom'] },
  color: { type: 'color', default: new Color(1, 0, 0, 1) },
  backgroundColor: { type: 'color', default: new Color(0, 0, 0, 0) },
  position: { type: 'vector2', default: new Vector2(0.5, 0.5) },
  anchor: { type: 'vector2', default: new Vector2(0.5, 0.5) },
  pivot: { type: 'vector2', default: new Vector2(0, 0) },
  rotation: { type: 'number', default: 0 },
  text: { type: 'string', required: true },
  maxWidth: { type: 'number', default: 1.0 },
  maxHeight: { type: 'number', default: 0 }
}
