/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Rectangle, EventEmitter } from '../globals'
import BaseTexture from './base-texture'
import TextureUVs from '../utils/texture-uvs'

/**
 * A texture that can be applied to a {@link PhotoEditorSDK.Engine.Sprite}
 * @class
 * @extends EventEmitter
 * @memberof PhotoEditorSDK.Engine
 */
class Texture extends EventEmitter {
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
    this._onBaseTextureUpdated = this._onBaseTextureUpdated.bind(this)

    if (!this._baseTexture.isLoaded()) {
      this._baseTexture.once('loaded', this._onBaseTextureLoaded)
    } else {
      const { width, height } = baseTexture.getFrame()
      this._frame = new Rectangle(0, 0, width, height)
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
   * @param  {HTMLCanvasElement} canvas
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

    this._baseTexture.on('update', this._onBaseTextureUpdated)
  }

  /**
   * Gets called when the base texture has been updated
   * @private
   */
  _onBaseTextureUpdated () {
    const { width, height } = this._baseTexture.getFrame()
    this._frame.width = width
    this._frame.height = height
    this.emit('update')
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

  /**
   * Returns the base texture
   * @return {PhotoEditorSDK.Engine.BaseTexture}
   */
  getBaseTexture () { return this._baseTexture }

  /**
   * Sets the base texture
   * @param {PhotoEditorSDK.Engine.BaseTexture} baseTexture
   */
  setBaseTexture (baseTexture) { this._baseTexture = baseTexture }

  /**
   * Returns the frame
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  getFrame () { return this._frame }

  /**
   * Sets the frame
   * @param {PhotoEditorSDK.Math.Rectangle} frame
   */
  setFrame (frame) {
    this._frame = frame
    this._updateUVs()
  }

  /**
   * Returns the width
   * @return {Number}
   */
  getWidth () { return this._frame.width }

  /**
   * Returns the height
   * @return {Number}
   */
  getHeight () { return this._frame.height }

  /**
   * Returns the texture UVs
   * @return {PhotoEditorSDK.Engine.TextureUVs}
   */
  getUVs () { return this._uvs }
}

export default Texture
