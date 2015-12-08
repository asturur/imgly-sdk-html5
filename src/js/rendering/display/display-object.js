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
  }

  /**
   * Renders this DisplayObject using the given WebGLRenderer
   * @param  {WebGLRenderer} renderer
   * @abstract
   */
  renderWebGL (renderer) {

  }

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  getPosition () { return this._position }
  setPosition (position) { this._position = position }
  getScale () { return this._scale }
  setScale (scale) { this._scale = scale }
  getPivot () { return this._pivot }
  setPivot (pivot) { this._pivot = pivot }
  getRotation () { return this._rotation }
  setRotation (rotation) { this._rotation = rotation }
  getAlpha () { return this._alpha }
  setAlpha (alpha) { this._alpha = alpha }
  getWorldTransform () { return this._worldTransform }
}
