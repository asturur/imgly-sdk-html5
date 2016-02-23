/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * An ArrayStream provides methods for working with a byte array
 * @class
 * @memberof PhotoEditorSDK
 * @ignore
 */
class ArrayStream {
  /**
   * Creates an ArrayStream
   * @param  {Array} buf
   */
  constructor (buf) {
    this._head = 0
    this._buf = buf
  }

  /**
   * Returns the value of the following 8 bit integer
   * @return {Number}
   */
  peekInt8 () {
    return this._buf[this._head]
  }

  /**
   * Returns the value of the following 16 bit integer
   * @param  {Boolean} [littleEndian = false]
   * @return {Number}
   */
  peekInt16 (littleEndian = false) {
    const a = this._buf[this._head]
    const b = this._buf[this._head + 1]
    if (!littleEndian) {
      return (a << 8) + b
    } else {
      return (b << 8) + a
    }
  }

  /**
   * Returns the value of the following 24 bit integer
   * @param  {Boolean} [littleEndian = false]
   * @return {Number}
   */
  peekInt24 (littleEndian = false) {
    const a = this._buf[this._head]
    const b = this._buf[this._head + 1]
    const c = this._buf[this._head + 2]
    if (!littleEndian) {
      return (a << 16) + (b << 8) + c
    } else {
      return (c << 16) + (b << 8) + a
    }
  }

  /**
   * Returns the value of the following 32 bit integer
   * @param  {Boolean} [littleEndian = false]
   * @return {Number}
   */
  peekInt32 (littleEndian = false) {
    const a = this._buf[this._head]
    const b = this._buf[this._head + 1]
    const c = this._buf[this._head + 2]
    const d = this._buf[this._head + 3]
    if (!littleEndian) {
      return (a << 32) + (b << 16) + (c << 8) + d
    } else {
      return (d << 32) + (c << 16) + (b << 8) + a
    }
  }

  /**
   * Writes the given 16 bit integer at the current head position
   * @param  {Number} num
   */
  writeInt16 (num) {
    this._buf[this._head] = num >> 8 // upper
    this._buf[this._head + 1] = num & 0xff // lower
  }

  /**
   * Returns the value of the following 8 bit integer and moves the head by 1 byte
   * @return {Number}
   */
  readInt8 () {
    const num = this.peekInt8()
    this._head += 1
    return num
  }

  /**
   * Returns the value of the following 16 bit integer and moves the head by 2 bytes
   * @param  {Boolean} [littleEndian = false]
   * @return {Number}
   */
  readInt16 (littleEndian = false) {
    const num = this.peekInt16(littleEndian)
    this._head += 2
    return num
  }

  /**
   * Returns the value of the following 24 bit integer and moves the head by 3 bytes
   * @param  {Boolean} [littleEndian = false]
   * @return {Number}
   */
  readInt24 (littleEndian = false) {
    const num = this.peekInt24(littleEndian)
    this._head += 3
    return num
  }

  /**
   * Returns the value of the following 32 bit integer and moves the head by 4 bytes
   * @param  {Boolean} [littleEndian = false]
   * @return {Number}
   */
  readInt32 (littleEndian = false) {
    const num = this.peekInt32(littleEndian)
    this._head += 4
    return num
  }

  /**
   * Reads a string with the given length
   * @param  {Number} length
   * @return {String}
   */
  readString (length) {
    let str = ''
    for (let i = 0; i < length; i++) {
      const character = this.readInt8()
      str += String.fromCharCode(character)
    }
    return str
  }

  /**
   * Returns the current head position
   * @return {Number}
   */
  getHead () {
    return this._head
  }

  /**
   * Sets the head position
   * @param {Number} head
   */
  setHead (head) {
    this._head = head
  }
}

export default ArrayStream
