/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const BATCH_SIZE = 2000
const VERTEX_SIZE = 5
const VERTEX_BYTE_SIZE = VERTEX_SIZE * 4

import ObjectRenderer from './object-renderer'

export default class SpriteRenderer extends ObjectRenderer {
  constructor (...args) {
    super(...args)

    this._maxBatchSize = BATCH_SIZE
    this._vertices = new ArrayBuffer(BATCH_SIZE * 4 * VERTEX_BYTE_SIZE)
    this._positions = new Float32Array(this._vertices)
    this._colors = new Uint32Array(this._vertices)
    this._indices = new Uint16Array(BATCH_SIZE * 6)

    this._shaders = []
    this._sprites = []

    this._currentBatchSize = 0
    this._currentBaseTexture = null
  }

  /**
   * Adds the given sprite to the batch
   * @param  {Sprite} sprite
   */
  render (sprite) {
    const texture = sprite.getTexture()
    const textureFrame = texture.getFrame()
    const baseTexture = texture.getBaseTexture()

    if (this._currentBatchSize >= this._maxBatchSize) {
      this.flush()
      this._currentBaseTexture = baseTexture
    }

    const uvs = texture.getUVs()
    if (!uvs) { return }

    // Transform sprite coords with anchor in mind
    const anchor = sprite.getAnchor()

    console.log(textureFrame)

    const w0 = textureFrame.width * (1 - anchor.x)
    const w1 = textureFrame.width * -anchor.x
    const h0 = textureFrame.height * (1 - anchor.y)
    const h1 = textureFrame.height * -anchor.y

    const index = this._currentBatchSize * VERTEX_BYTE_SIZE
    const worldTransform = sprite.getWorldTransform()
  }

  /**
   * Gets called when the rendering context changes
   * @private
   */
  _onContextChange () {
    const gl = this._renderer.getContext()

    this._shader = this._renderer.shaders.default

    this._vertexBuffer = gl.createBuffer()
    this._indexBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW)
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
