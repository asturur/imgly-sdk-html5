/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * Represents a Rectangle
 * @class
 * @memberof PhotoEditorSDK.Math
 */
class Rectangle {
  /**
   * Creartes a Rectangle
   * @param {Number} [x = 0]
   * @param {Number} [y = 0]
   * @param {Number} [width  = 0]
   * @param {Number} [height = 0]
   */
  constructor (x = 0, y = 0, width = 0, height = 0) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  /**
   * Sets the given values
   * @param {Number} x
   * @param {Number} y
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  set (x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    return this
  }

  /**
   * Creates a clone of this rectangle
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  clone () {
    return new Rectangle(this.x, this.y, this.width, this.height)
  }

  /**
   * Copies the values of the given rectangle
   * @param  {PhotoEditorSDK.Math.Rectangle} other
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  copy (other) {
    this.x = other.x
    this.y = other.y
    this.width = other.width
    this.height = other.height
    return this
  }

  /**
   * Checks whether this rectangle's values are the same as the given ones
   * @param  {(Number|PhotoEditorSDK.Math.Rectangle)} rect
   * @param  {Number} y
   * @param  {Number} width
   * @param  {Number} height
   * @return {Boolean}
   */
  equals (rect, y, width, height) {
    if (rect instanceof Rectangle) {
      return rect.x === this.x &&
        rect.y === this.y &&
        rect.width === this.width &&
        rect.height === this.height
    } else {
      const x = rect
      return x === this.x &&
        y === this.y &&
        width === this.width &&
        height === this.height
    }
  }

  /**
   * Rounds this rectangle's values
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  round () {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)
    this.width = Math.round(this.width)
    this.height = Math.round(this.height)
    return this
  }

  /**
   * Returns a string representation of this rectangle
   * @return {String}
   */
  toString () {
    return `Rectangle({ x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height} })`
  }
}

export default Rectangle
