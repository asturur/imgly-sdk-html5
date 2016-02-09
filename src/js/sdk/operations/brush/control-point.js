/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class ControlPoint {
  constructor (path, position) {
    this._path = path
    this._drawnCanvases = []
    this._position = position
  }

  renderToCanvas (canvas, lastControlPoint) {
    if (this._drawnCanvases.indexOf(canvas) !== -1) {
      // This control point has already been drawn on this canvas. Ignore.
      return
    }

    const context = canvas.getContext('2d')
    const position = this._position
    const lastPosition = lastControlPoint.getPosition()

    context.beginPath()
    context.lineJoin = 'round'
    context.strokeStyle = this._path.getColor().toRGBA()
    context.lineWidth = this._path.getThickness()
    context.moveTo(lastPosition.x, lastPosition.y)
    context.lineTo(position.x, position.y)
    context.closePath()
    context.stroke()
    this._drawnCanvases.push(canvas)
  }

  getPosition () {
    return this._position.clone()
  }

  setDirty () {
    this._drawnCanvases = []
  }
}
