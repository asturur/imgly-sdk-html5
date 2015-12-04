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
   * Gets called when the rendering context changes
   * @private
   */
  _onContextChange () {
    this._shader = this._renderer.shaders.default
  }

  /**
   * Gets called when this object renderer is activated
   */
  start () {

  }

  /**
   * Renders whatever has been queued
   */
  flush () {
    const renderer = this._renderer

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

    this._uploadCoordinates()

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  /**
   * Uploads the texture and vector coordinates
   * @private
   */
  _uploadCoordinates () {
    const attributeLocations = this._shader.getAttributeLocations()
    const gl = this._renderer.getContext()

    const texCoordBuffer = gl.createBuffer()
    const textureCoordinates = new Float32Array([
      // First triangle
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,

      // Second triangle
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ])
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.vertexAttribPointer(attributeLocations.a_texCoord, 2, gl.FLOAT, false, 0, 0)
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(attributeLocations.a_texCoord)

    const positionBuffer = gl.createBuffer()
    const vectorCoordinates = new Float32Array([
      // First triangle
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,

      // Second triangle
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0
    ])
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(attributeLocations.a_position, 2, gl.FLOAT, false, 0, 0)
    gl.bufferData(gl.ARRAY_BUFFER, vectorCoordinates, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(attributeLocations.a_position)
  }
}
