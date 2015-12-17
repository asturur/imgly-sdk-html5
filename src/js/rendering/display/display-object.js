/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const { Matrix, Vector2 } = PhotoEditorSDK

export default class DisplayObject {
  constructor () {
    this._position = new Vector2(0, 0)
    this._scale = new Vector2(1, 1)
    this._pivot = new Vector2(0, 0)
    this._rotation = 0
    this._lastRotation = null
    this._alpha = 1
    this._worldTransform = new Matrix()
    this._parent = null
  }

  /**
   * Renders this DisplayObject using the given WebGLRenderer
   * @param  {WebGLRenderer} renderer
   * @abstract
   */
  renderWebGL (renderer) {

  }

  /**
   * Updates the world transform for this DisplayObject
   */
  updateTransform () {
    const parentTransform = this._parent.getWorldTransform()
    const worldTransform = this._worldTransform

    // Only build rotation matrix if rotation has changed since last update
    const rotationChanged = this._rotation !== this._lastRotation
    if (rotationChanged) {
      this._sinRotation = Math.sin(this._rotation)
      this._cosRotation = Math.cos(this._rotation)
      this._lastRotation = this._rotation
    }

    worldTransform.a = this._cosRotation * this._scale.x
    worldTransform.b = this._sinRotation * this._scale.x
    worldTransform.c = -this._sinRotation * this._scale.y
    worldTransform.d = this._cosRotation * this._scale.y
    worldTransform.tx = this._position.x
    worldTransform.ty = this._position.y

    if (this._pivot.x || this._pivot.y) {
      worldTransform.tx -= this._pivot.x * worldTransform.a + this._pivot.y * worldTransform.c
      worldTransform.ty -= this._pivot.x * worldTransform.b + this._pivot.y * worldTransform.d
    }

    worldTransform.multiply(parentTransform)
  }

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  getPosition () { return this._position }
  setPosition (position, y) {
    if (position instanceof Vector2) {
      this._position.copy(position)
    } else {
      this._position.set(position, y)
    }
  }
  getScale () { return this._scale }
  setScale (scale, y) {
    if (scale instanceof Vector2) {
      this._scale.copy(scale)
    } else {
      this._scale.set(scale, y)
    }
  }
  getPivot () { return this._pivot }
  setPivot (pivot, y) {
    if (pivot instanceof Vector2) {
      this._pivot.copy(pivot)
    } else {
      this._pivot.set(pivot, y)
    }
  }
  getRotation () { return this._rotation }
  setRotation (rotation) { this._rotation = rotation }
  getAlpha () { return this._alpha }
  setAlpha (alpha) { this._alpha = alpha }
  getWorldTransform () { return this._worldTransform }
  getParent () { return this._parent }
  setParent (parent) { this._parent = parent }
}
