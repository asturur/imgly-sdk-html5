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

    // @TODO: Rotation
    worldTransform.a = this._scale.x * parentTransform.a
    worldTransform.b = this._scale.x * parentTransform.b
    worldTransform.c = this._scale.y * parentTransform.c
    worldTransform.d = this._scale.y * parentTransform.d
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
