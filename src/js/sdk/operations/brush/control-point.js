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
 * A ControlPoint is a part of a {@link PhotoEditorSDK.Operations.BrushOperation.Path}, so a Path
 * consists of multiple ControlPoints. Should only be created using {@link PhotoEditorSDK.Operations.BrushOperation.Path#addControlPoint}
 * @class
 * @memberof PhotoEditorSDK.Operations.BrushOperation
 */
class ControlPoint {
  /**
   * Creates a ControlPoint
   * @param  {PhotoEditorSDK.Operations.BrushOperation.Path} path
   * @param  {PhotoEditorSDK.Math.Vector2} position
   */
  constructor (path, position) {
    this._path = path
    this._drawnCanvases = []
    this._position = position
  }

  /**
   * Renders this ControlPoint to the given canvas
   * @param  {HTMLCanvasElement} canvas
   * @param  {PhotoEditorSDK.Operations.BrushOperation.ControlPoint} lastControlPoint
   */
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

  /**
   * Sets the position
   * @param {PhotoEditorSDK.Math.Vector2} position
   */
  setPosition (position) {
    this._position = position
  }

  /**
   * Returns the position
   * @return {PhotoEditorSDK.Math.Vector2}
   */
  getPosition () {
    return this._position.clone()
  }

  /**
   * Sets this ControlPoint to dirty
   */
  setDirty () {
    this._drawnCanvases = []
  }
}

export default ControlPoint
