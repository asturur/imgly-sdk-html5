/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { EventEmitter } from '../../globals'
import ControlPoint from './control-point'

/**
 * A path that can be drawn on a {@link PhotoEditorSDK.Operations.BrushOperation}. Should only be
 * created using {@link PhotoEditorSDK.Operations.BrushOperation#createPath}
 * @class
 * @extends PhotoEditorSDK.EventEmitter
 * @memberof PhotoEditorSDK.Operations.BrushOperation
 */
class Path extends EventEmitter {
  /**
   * Creates a Path
   * @param  {PhotoEditorSDK.Operations.BrushOperation} operation
   * @param  {Number} thickness
   * @param  {PhotoEditorSDK.Color} color
   */
  constructor (operation, thickness, color) {
    super()
    this._thickness = thickness
    this._color = color
    this._controlPoints = []
  }

  /**
   * Draws this path onto the given canvas
   * @param  {HTMLCanvasElement} canvas
   */
  renderToCanvas (canvas) {
    if (this._controlPoints.length < 2) return

    let lastControlPoint = this._controlPoints[0]
    let controlPoint = lastControlPoint
    for (let i = 1; i < this._controlPoints.length; i++) {
      controlPoint = this._controlPoints[i]
      controlPoint.renderToCanvas(canvas, lastControlPoint)
      lastControlPoint = controlPoint
    }
  }

  /**
   * Adds a control point at the given position to this path
   * @param {PhotoEditorSDK.Math.Vector2} position
   */
  addControlPoint (position) {
    const controlPoint = new ControlPoint(this, position)
    this._controlPoints.push(controlPoint)
    this.emit('update')
  }

  /**
   * Returns the path color
   * @return {PhotoEditorSDK.Color}
   */
  getColor () {
    return this._color
  }

  /**
   * Returns the path's stroke thickness
   * @return {Number}
   */
  getThickness () {
    return this._thickness
  }

  /**
   * Sets this path to dirty
   */
  setDirty () {
    this._controlPoints.forEach((point) => {
      point.setDirty()
    })
  }

  /**
   * Calls `iterator` for each control point
   * @param  {Function} iterator
   */
  forEachControlPoint (iterator) {
    this._controlPoints.forEach(iterator)
  }
}

export default Path
