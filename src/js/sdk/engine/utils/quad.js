/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class Quad {
  constructor (renderer) {
    this._renderer = renderer

    this._vertices = new Float32Array([
      0, 0,
      100, 0,
      100, 100,
      0, 100
    ])

    this._uvs = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ])

    this._indices = new Uint16Array([
      0, 1, 2, 0, 3, 2
    ])

    this._colors = new Float32Array([
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1
    ])

    this._initBuffers()
    this._uploadBuffers()
  }

  /**
   * Maps the given rectangles to the quad
   * @param  {Rectangle} rect1
   * @param  {Rectangle} rect2
   */
  map (rect1, rect2) {
    const { x, y } = rect2

    // Update the UVs
    // We don't have any translation, so these four
    // values are all we need
    this._uvs[2] = rect2.width / rect1.width
    this._uvs[4] = this._uvs[2]
    this._uvs[5] = rect2.height / rect1.height
    this._uvs[7] = this._uvs[5]

    // Update the vertices
    this._vertices[0] = x
    this._vertices[1] = y

    this._vertices[2] = x + rect2.width
    this._vertices[3] = y

    this._vertices[4] = this._vertices[2]
    this._vertices[5] = y + rect2.height

    this._vertices[6] = x
    this._vertices[7] = this._vertices[5]

    this._uploadBuffers()
  }

  /**
   * Initializes the buffers
   * @private
   */
  _initBuffers () {
    const gl = this._renderer.getContext()

    // Init vertex buffer
    this._vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, (8 + 8 + 16) * 4, gl.DYNAMIC_DRAW)

    this._indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW)
  }

  /**
   * Uploads the buffers
   * @private
   */
  _uploadBuffers () {
    const gl = this._renderer.getContext()

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._vertices)
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * 4, this._uvs)
    gl.bufferSubData(gl.ARRAY_BUFFER, (8 + 8) * 4, this._colors)
  }

  getVertexBuffer () { return this._vertexBuffer }
  getIndexBuffer () { return this._indexBuffer }
}
