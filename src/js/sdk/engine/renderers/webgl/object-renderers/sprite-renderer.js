/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Globals from '../../../globals'
import ObjectRenderer from './object-renderer'

export default class SpriteRenderer extends ObjectRenderer {
  constructor (...args) {
    super(...args)

    this._maxBatchSize = Globals.BATCH_SIZE
    this._vertices = new ArrayBuffer(Globals.BATCH_SIZE * 4 * Globals.VERTEX_BYTE_SIZE)
    this._positions = new Float32Array(this._vertices)
    this._colors = new Uint32Array(this._vertices)
    this._indices = new Uint16Array(Globals.BATCH_SIZE * 6)

    // Fill vertex position indices
    for (var i = 0, j = 0; i < Globals.BATCH_SIZE * 6; i += 6, j += 4) {
      this._indices[i + 0] = j + 0
      this._indices[i + 1] = j + 1
      this._indices[i + 2] = j + 2
      this._indices[i + 3] = j + 0
      this._indices[i + 4] = j + 2
      this._indices[i + 5] = j + 3
    }

    this._shaders = []
    this._sprites = []

    this._currentBatchSize = 0
    this._currentBaseTexture = null

    this._onContextChange()
  }

  /**
   * Adds the given sprite to the batch
   * @param  {Sprite} sprite
   */
  render (sprite) {
    const texture = sprite.getTexture()
    const textureFrame = texture.getFrame()
    const baseTexture = texture.getBaseTexture()

    // Has the maximum batch size been reached? Flush!
    if (this._currentBatchSize >= this._maxBatchSize) {
      this.flush()
      this._currentBaseTexture = baseTexture
    }

    // No updated UVs => No rendering
    const uvs = texture.getUVs()
    if (!uvs) { return }

    // Fill positions array
    const index = this._currentBatchSize * Globals.VERTEX_BYTE_SIZE
    this._addVertexCoordinates(sprite, index, textureFrame)
    this._addTextureUVs(sprite, index, uvs)
    this._addColors(sprite, index)

    // Add the sprite to the list of sprites
    this._sprites[this._currentBatchSize] = sprite
    this._currentBatchSize++
  }

  /**
   * Adds the color to the positions array for the given sprite
   * @param {Sprite} sprite
   * @param {Number} index
   * @private
   */
  _addColors (sprite, index) {
    const colors = this._colors
    const tint = 0xffffff
    const color = (tint >> 16) + (tint & 0xff00) + ((tint & 0xff) << 16) + (255 << 24)
    colors[index + 4] =
      colors[index + 9] =
      colors[index + 14] =
      colors[index + 19] = color
  }

  /**
   * Adds the texture UV coordinates to the positions array for the given sprite
   * @param {Sprite} sprite
   * @param {Number} index
   * @param {TextureUVs} uvs
   * @private
   */
  _addTextureUVs (sprite, index, uvs) {
    const positions = this._positions

    // Add UVs
    let uvCoords = uvs.getUVs(0)
    positions[index + 2] = uvCoords.x
    positions[index + 3] = uvCoords.y

    uvCoords = uvs.getUVs(1)
    positions[index + 7] = uvCoords.x
    positions[index + 8] = uvCoords.y

    uvCoords = uvs.getUVs(2)
    positions[index + 12] = uvCoords.x
    positions[index + 13] = uvCoords.y

    uvCoords = uvs.getUVs(3)
    positions[index + 17] = uvCoords.x
    positions[index + 18] = uvCoords.y
  }

  /**
   * Adds the vertex coordinates to the positions array for the given
   * sprite and texture frame
   * @param {Sprite} sprite
   * @param {Number} index
   * @param {Rectangle} textureFrame
   * @private
   */
  _addVertexCoordinates (sprite, index, textureFrame) {
    const positions = this._positions
    const worldTransform = sprite.getWorldTransform()

    // Transform sprite coords with anchor in mind
    const anchor = sprite.getAnchor()
    const rectPositions = worldTransform.rectangleToCoordinates(textureFrame, anchor)

    const stride = 5
    for (var i = 0; i < 4; i++) {
      positions[index + i * stride] = rectPositions[i].x
      positions[index + i * stride + 1] = rectPositions[i].y
    }
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
    this._shader.setupBuffers(this._vertexBuffer, this._indexBuffer)
  }

  /**
   * Renders the queued sprites in batches, every time the base texture has changed,
   * it flushes the current batch to the graphics card
   */
  flush () {
    const renderer = this._renderer
    const gl = renderer.getContext()

    if (this._currentBatchSize === 0) return

    if (this._currentBatchSize > Globals.BATCH_SIZE * 0.5) {
      // Upload whole ArrayBuffer
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._vertices)
    } else {
      // Only upload sub array
      const subArray = this._positions.subarray(0, this._currentBatchSize * Globals.VERTEX_BYTE_SIZE)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, subArray)
    }

    // Init variables
    let currentBatchSize = 0
    let currentBaseTexture = null
    let nextBaseTexture = null
    let currentShader = null
    let nextShader = null
    let shaderChanged = false
    let textureChanged = false
    let sprite = null
    let batchStartIndex = 0

    for (let i = 0, j = this._currentBatchSize; i < j; i++) {
      sprite = this._sprites[i]

      nextBaseTexture = sprite.getTexture().getBaseTexture()
      nextShader = sprite.getShader() || this._shader
      shaderChanged = currentShader !== nextShader
      textureChanged = currentBaseTexture !== nextBaseTexture

      if (textureChanged || shaderChanged) {
        this._renderBatch(currentBaseTexture, currentBatchSize, batchStartIndex)

        batchStartIndex = i
        currentBatchSize = 0
        currentBaseTexture = nextBaseTexture

        // Shader has changed, set it
        if (shaderChanged) {
          currentShader = nextShader
          renderer.setShader(currentShader)

          const renderTarget = renderer.getCurrentRenderTarget()
          const projectionMatrix = renderTarget.getProjectionMatrix().toArray()
          currentShader.setUniform('u_projMatrix', projectionMatrix)
          currentShader.syncUniforms()

          gl.activeTexture(gl.TEXTURE0)
        }
      }

      currentBatchSize++
    }

    this._renderBatch(currentBaseTexture, currentBatchSize, batchStartIndex)

    // Reset the batch
    this._currentBatchSize = 0
    this._sprites = []
  }

  /**
   * Renders the current batch
   * @param  {BaseTexture} baseTexture
   * @param  {Number} batchSize
   * @param  {Number} batchStartIndex
   * @private
   */
  _renderBatch (baseTexture, batchSize, batchStartIndex) {
    if (batchSize === 0) return

    const renderer = this._renderer
    const gl = renderer.getContext()

    let glTexture = baseTexture.getGLTextureForId(gl.id)
    if (!glTexture) {
      glTexture = renderer.getOrCreateGLTexture(baseTexture)
      renderer.updateTexture(baseTexture)
    }
    gl.activeTexture(gl.TEXTURE0 + baseTexture.getGLUnit())
    gl.bindTexture(gl.TEXTURE_2D, glTexture)

    const verticesCount = batchSize * 6
    const vertexOffset = batchStartIndex * 6 * 2
    gl.drawElements(gl.TRIANGLES, verticesCount, gl.UNSIGNED_SHORT, vertexOffset)
  }
}
