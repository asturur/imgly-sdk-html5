/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { EventEmitter } from '../globals'
import BaseTexture from './base-texture'
import TextureUVs from '../utils/texture-uvs'

export default class Texture extends EventEmitter {
  constructor (baseTexture, frame) {
    super()

    if (!(baseTexture instanceof BaseTexture)) {
      throw new Error('\`baseTexture\` should be an instance of BaseTexture')
    }
    this._baseTexture = baseTexture
    this._uvs = new TextureUVs()
    this._frame = frame ? frame.clone() : null

    // Bind event handlers
    this._onBaseTextureLoaded = this._onBaseTextureLoaded.bind(this)

    if (!this._baseTexture.isLoaded()) {
      this._baseTexture.once('loaded', this._onBaseTextureLoaded)
    } else {
      this._onBaseTextureLoaded()
    }
  }

  /**
   * Creates a texture from the given image
   * @param  {Image} image
   */
  static fromImage (image) {
    const baseTexture = new BaseTexture(image)
    return new Texture(baseTexture)
  }

  /**
   * Creates a texture from the given canvas
   * @param  {CanvasElement} canvas
   */
  static fromCanvas (canvas) {
    const baseTexture = new BaseTexture(canvas)
    return new Texture(baseTexture)
  }

  /**
   * Gets called when the base texture has been loaded
   * @private
   */
  _onBaseTextureLoaded () {
    const frame = this._baseTexture.getFrame().clone()
    this.setFrame(frame)
  }

  /**
   * Updates the UV coordinates of this texture
   * @private
   */
  _updateUVs () {
    this._uvs.update(
      this._frame,
      this._baseTexture.getFrame()
    )
  }

  getBaseTexture () { return this._baseTexture }
  setBaseTexture (texture) { this._baseTexture = texture }
  getFrame () { return this._frame }
  setFrame (frame) {
    this._frame = frame

    this._updateUVs()
  }
  getWidth () { return this._frame.width }
  getHeight () { return this._frame.height }
  getUVs () { return this._uvs }
}
