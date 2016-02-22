/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Log, Matrix, Vector2, Rectangle } from '../globals'

/**
 * The base class for all objects that can be displayed
 * on the screen
 * @class
 * @alias Engine.DisplayObject
 * @memberof PhotoEditorSDK
 */
class DisplayObject {
  /**
   * Creates a DisplayObject
   */
  constructor () {
    this._position = new Vector2(0, 0)
    this._scale = new Vector2(1, 1)
    this._pivot = new Vector2(0, 0)
    this._rotation = 0
    this._lastRotation = null
    this._alpha = 1
    this._visible = true
    this._worldTransform = new Matrix()
    this._parent = null
    this._shaders = []
    this._boundsNeedUpdate = true
    this._bounds = new Rectangle(0, 0, 1, 1)
    this._localBoundsNeedUpdate = true
    this._localBounds = new Rectangle(0, 0, 1, 1)
    this._tint = 0xffffff
  }

  /**
   * Renders this DisplayObject using the given WebGLRenderer
   * @param  {PhotoEditorSDK.Engine.WebGLRenderer} renderer
   * @abstract
   */
  renderWebGL (renderer) {
    Log.warn(this.constructor.name, '`renderWebGL` is abstract and not implemented in inherited class')
  }

  /**
   * Renders this DisplayObject using the given CanvasRenderer
   * @param  {PhotoEditorSDK.Engine.CanvasRenderer} renderer
   * @abstract
   */
  renderCanvas (renderer) {
    Log.warn(this.constructor.name, '`renderCanvas` is abstract and not implemented in inherited class')
  }

  /**
   * Updates the world transform for this DisplayObject
   */
  updateTransform () {
    const parentTransform = this._parent ? this._parent.getWorldTransform() : Matrix.IDENTITY
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

    this._boundsNeedUpdate = true
    this._localBoundsNeedUpdate = true
  }

  // -------------------------------------------------------------------------- SHADERS

  /**
   * Pushes the given shader to the list of shaders
   * @param {PhotoEditorSDK.Engine.Shader} shader
   */
  addShader (shader) {
    this._shaders.push(shader)
  }

  /**
   * Removes the given shader from the list of shaders
   * @param  {PhotoEditorSDK.Engine.Shader} shader
   * @return {Boolean}
   */
  removeShader (shader) {
    const index = this._shaders.indexOf(shader)
    if (index !== -1) {
      this._shaders.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Removes the shader at the given index from the list of shaders
   * @param  {Number} index
   * @return {Boolean}
   */
  removeShaderAt (index) {
    if (!this._shaders[index]) {
      return false
    }
    this._shaders.splice(index, 1)
    return true
  }

  /**
   * Returns the bounds for this DisplayObject
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  getBounds () {
    return this._bounds.clone()
  }

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  /**
   * Returns the current position
   * @return {PhotoEditorSDK.Math.Vector2}
   */
  getPosition () { return this._position }

  /**
   * Sets the position to the given one
   * @param {PhotoEditorSDK.Math.Vector2|Number} x
   * @param {Number} [y]
   */
  setPosition (position, y) {
    if (position instanceof Vector2) {
      this._position.copy(position)
    } else {
      this._position.set(position, y)
    }
    this._boundsNeedUpdate = true
    this._localBoundsNeedUpdate = true
  }

  /**
   * Returns the current scale
   * @return {PhotoEditorSDK.Math.Vector2}
   */
  getScale () { return this._scale }

  /**
   * Sets the scale to the given one
   * @param {PhotoEditorSDK.Math.Vector2|Number} x
   * @param {Number} [y]
   */
  setScale (scale, y) {
    if (scale instanceof Vector2) {
      this._scale.copy(scale)
    } else {
      this._scale.set(scale, y)
    }
    this._boundsNeedUpdate = true
    this._localBoundsNeedUpdate = true
  }

  /**
   * Returns the current pivot (The point that this Displayobject rotates around)
   * @return {PhotoEditorSDK.Math.Vector2}
   */
  getPivot () { return this._pivot }

  /**
   * Sets the pivot (The point that this DisplayObject rotates around)
   * @param {PhotoEditorSDK.Math.Vector2|Number} pivot
   * @param {Number} [y]
   */
  setPivot (pivot, y) {
    if (pivot instanceof Vector2) {
      this._pivot.copy(pivot)
    } else {
      this._pivot.set(pivot, y)
    }
    this._boundsNeedUpdate = true
    this._localBoundsNeedUpdate = true
  }

  /**
   * Returns the current rotation in radians
   * @return {Number}
   */
  getRotation () { return this._rotation }

  /**
   * Sets this object's rotation (in radians)
   * @param {Number} rotation
   */
  setRotation (rotation) {
    this._rotation = rotation
    this._boundsNeedUpdate = true
    this._localBoundsNeedUpdate = true
  }

  /**
   * Returns the current alpha (0...1)
   * @return {Number}
   */
  getAlpha () { return this._alpha }

  /**
   * Sets the alpha (0...1)
   * @param {Number} alpha
   */
  setAlpha (alpha) { this._alpha = alpha }

  /**
   * Returns the current world transformation matrix
   * @return {PhotoEditorSDK.Math.Matrix}
   */
  getWorldTransform () { return this._worldTransform }

  /**
   * Returns the parent object
   * @return {PhotoEditorSDK.Engine.DisplayObject}
   */
  getParent () { return this._parent }

  /**
   * Sets this object's parent object
   * @param {PhotoEditorSDK.Engine.DisplayObject} parent
   */
  setParent (parent) { this._parent = parent }

  /**
   * Returns the current tint color
   * @return {Number}
   */
  getTint () { return this._tint }

  /**
   * Sets the tint color
   * @param {Number} tint
   */
  setTint (tint) { this._tint = tint }

  /**
   * Checks whether this object is currently visible
   * @return {Boolean} [description]
   */
  isVisible () { return this._visible }

  /**
   * Sets this object's visibility
   * @param {Boolean} visible
   */
  setVisible (visible) { this._visible = visible }
}

export default DisplayObject
