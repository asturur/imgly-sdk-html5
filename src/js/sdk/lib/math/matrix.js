/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Vector2 from './vector2'

/**
 * Represents a 3-dimensional matrix
 * @class
 * @alias PhotoEditorSDK.Matrix
 * @private
 */
export default class Matrix {
  constructor () {
    this.reset()
  }

  /**
   * Multiplies this matrix with the given one
   * @param  {Matrix} matrix
   * @return {Matrix}
   */
  multiply (matrix) {
    let a, b, c, d, tx, ty
    a = this.a * matrix.a + this.b * matrix.c
    b = this.a * matrix.b + this.b * matrix.d
    c = this.c * matrix.a + this.d * matrix.c
    d = this.c * matrix.b + this.d * matrix.d
    tx = this.tx * matrix.a + this.ty * matrix.c + matrix.tx
    ty = this.tx * matrix.b + this.ty * matrix.d + matrix.ty

    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.tx = tx
    this.ty = ty
    return this
  }

  /**
   * Turns the given rectangle into vector coordinates by applying this Matrix
   * @param  {Rectangle}  rectangle
   * @param  {Vector2} anchor
   * @return {Array.<Vector2>}
   */
  rectangleToCoordinates (rectangle, anchor = new Vector2(0, 0)) {
    // Anchor offsets (w0 = right, w1 = left, h0 = up, h1 = down)
    const w0 = rectangle.width * (1 - anchor.x)
    const w1 = rectangle.width * -anchor.x
    const h0 = rectangle.height * (1 - anchor.y)
    const h1 = rectangle.height * -anchor.y

    let positions = []

    // Bottom Left
    positions.push(new Vector2(
      this.a * w1 + this.c * h1 + this.tx,
      this.d * h1 + this.b * w1 + this.ty
    ))

    // Bottom Right
    positions.push(new Vector2(
      this.a * w0 + this.c * h1 + this.tx,
      this.d * h1 + this.b * w0 + this.ty
    ))

    // Top Right
    positions.push(new Vector2(
      this.a * w0 + this.c * h0 + this.tx,
      this.d * h0 + this.b * w0 + this.ty
    ))

    // Top Left
    positions.push(new Vector2(
      this.a * w1 + this.c * h0 + this.tx,
      this.d * h0 + this.b * w1 + this.ty
    ))

    return positions
  }

  /**
   * Resets this matrix to the identity matrix
   */
  reset () {
    this.a = 1
    this.b = 0
    this.c = 0
    this.d = 1
    this.tx = 0
    this.ty = 0
  }

  /**
   * Returns an array representation of this matrix
   * @return {Array}
   */
  toArray () {
    return new Float32Array(
      [
        this.a, this.b, 0,
        this.c, this.d, 0,
        this.tx, this.ty, 1
      ]
    )
  }

  static get IDENTITY () { return new Matrix() }
}
