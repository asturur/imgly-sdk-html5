/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine, Vector2, Color } from '../globals'
import Operation from './operation'

const DEFAULT_THICKNESS = 10
const DEFAULT_COLOR = new Color(1.0, 0.0, 0.0, 1.0)

/**
 * An operation that can draw brushes on the canvas
 *
 * @class
 * @alias PhotoEditorSDK.Operations.BrushOperation
 * @extends PhotoEditorSDK.Operation
 */
class BrushOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._brushCanvas = document.createElement('canvas')
    this._texture = Engine.Texture.fromCanvas(this._brushCanvas)
    this._sprite.setTexture(this._texture)

    this._inputSprite = new Engine.Sprite()
    this._container.removeChild(this._sprite)
    this._container.addChild(this._inputSprite)
    this._container.addChild(this._sprite)
  }

  /**
   * Renders the brush operation using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    this.renderBrushCanvas(sdk)

    const renderer = sdk.getRenderer()
    const outputSprite = sdk.getSprite()
    this._inputSprite.setTexture(outputSprite.getTexture())

    renderer.updateTexture(this._texture.getBaseTexture())

    const renderTexture = this._getRenderTexture(sdk)
    const outputBounds = outputSprite.getBounds()
    renderTexture.resizeTo(new Vector2(outputBounds.width, outputBounds.height))

    renderTexture.render(this._container)
    outputSprite.setTexture(renderTexture)

    return Promise.resolve()
  }

  /**
   * Renders the brush operation to a canvas
   * @param  {CanvasRenderer} renderer
   * @private
   */
  _renderCanvas (renderer) {
    this.renderBrushCanvas(renderer.getCanvas())
    var context = renderer.getContext()
    context.drawImage(this._brushCanvas, 0, 0)
  }

  /**
   * Renders the brush canvas that will be used as a texture in WebGL
   * and as an image in canvas
   * @param {Canvas} canvas
   * @private
   */
  renderBrushCanvas (sdk, canvas = this._brushCanvas) {
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)

    const finalDimensions = sdk.getFinalDimensions()
    if (canvas.width !== finalDimensions.x ||
        canvas.height !== finalDimensions.y) {
      canvas.width = finalDimensions.x
      canvas.height = finalDimensions.y
      this._texture.getBaseTexture().update()
    }

    const paths = this._options.paths
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      path.renderToCanvas(canvas)
    }
  }

  /**
   * Creates and adds a new path
   * @param {Number} thickness
   * @param {Color} color
   * @return {BrushOperation.Path}
   */
  createPath (thickness, color) {
    const path = new BrushOperation.Path(this, thickness, color)
    this._options.paths.push(path)
    return path
  }

  /**
   * returns the last color
   * @return {Color}
   */
  getLastColor () {
    const lastPath = this._options.paths[this._options.paths.length - 1]
    if (!lastPath) return DEFAULT_COLOR
    return lastPath.getColor()
  }

  /**
   * returns the last thickness
   * @return {Thickness}
   */
  getLastThickness () {
    const lastPath = this._options.paths[this._options.paths.length - 1]
    if (!lastPath) return DEFAULT_THICKNESS
    return lastPath.getThickness()
  }

  /**
   * Gets called when this operation has been set to dirty
   * @private
   */
  _onDirty () {
    this._options.paths.forEach((path) => {
      path.setDirty()
    })
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
BrushOperation.identifier = 'brush'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
BrushOperation.prototype.availableOptions = {
  paths: { type: 'array', default: [] }
}

/**
 * Represents a path that can be drawn on a canvas
 */
BrushOperation.Path = class Path {
  constructor (operation, thickness, color) {
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
    const controlPoint = new BrushOperation.ControlPoint(this, position)
    this._controlPoints.push(controlPoint)
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
}

/**
 * Represents a control point of a path
 */
BrushOperation.ControlPoint = class ControlPoint {
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
    context.strokeStyle = this._path.getColor().toHex()
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

export default BrushOperation
