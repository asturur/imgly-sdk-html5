/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import BaseTexture from './base-texture'

export default class Texture {
  constructor (baseTexture) {
    if (!(baseTexture instanceof BaseTexture)) {
      throw new Error('\`baseTexture\` should be an instance of BaseTexture')
    }
    this._baseTexture = baseTexture
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

  getBaseTexture () { return this._baseTexture }
  setBaseTexture (texture) { this._baseTexture = texture }
}
