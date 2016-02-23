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

class Path extends EventEmitter {
  constructor (operation, thickness, color) {
    super()
    this._thickness = thickness
    this._color = color
    this._controlPoints = []
  }

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

  addControlPoint (position) {
    const controlPoint = new ControlPoint(this, position)
    this._controlPoints.push(controlPoint)
    this.emit('update')
  }

  getColor () {
    return this._color
  }

  getThickness () {
    return this._thickness
  }

  setDirty () {
    this._controlPoints.forEach((point) => {
      point.setDirty()
    })
  }

  forEachControlPoint (iterator) {
    this._controlPoints.forEach(iterator)
  }
}

export default Path
