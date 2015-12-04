/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import ObjectRenderer from './object-renderer'

export default class SpriteRenderer extends ObjectRenderer {
  constructor (...args) {
    super(...args)
    this._sprites = []
  }

  /**
   * Adds the given sprite to the batch
   * @param  {Sprite} sprite
   */
  render (sprite) {
    this._sprites.push(sprite)
  }

  /**
   * Renders whatever has been queued
   */
  flush () {
    const renderer = this._renderer
    // const gl = renderer.getContext()

    this._sprites.forEach((sprite) => {
      const shader = sprite.getShader() || renderer.shaders.default
      renderer.setShader(shader)
      shader.syncUniforms()

      this._renderSprite(sprite)
    })
    this._sprites = []
  }

  /**
   * Renders the given sprite
   * @param  {Sprite} sprite
   * @private
   */
  _renderSprite (sprite) {
    const renderer = this._renderer
    const gl = renderer.getContext()

    const texture = sprite.getTexture()
    const glTexture = renderer.getOrCreateGLTexture(texture.getBaseTexture())
    gl.bindTexture(gl.TEXTURE_2D, glTexture)

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}
