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
import Path from './brush/path'
import ControlPoint from './brush/control-point'

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

    this._brushCanvasDirty = true
    this._brushCanvas = document.createElement('canvas')
    this._texture = Engine.Texture.fromCanvas(this._brushCanvas)
    this._sprite.setTexture(this._texture)

    this._inputSprite = new Engine.Sprite()
    this._container.removeChild(this._sprite)
    this._container.addChild(this._inputSprite)
    this._container.addChild(this._sprite)

    this._onPathUpdate = this._onPathUpdate.bind(this)
  }

  /**
   * Gets called when a path has been updated
   * @private
   */
  _onPathUpdate () {
    this.setDirty(true)
  }

  /**
   * Renders the brush operation
   * @param  {PhotoEditorSDK} sdk
   * @returns {Promise}
   * @override
   * @private
   */
  _render (sdk) {
    this.renderBrushCanvas(sdk)

    const renderer = sdk.getRenderer()
    const outputSprite = sdk.getSprite()
    this._inputSprite.setTexture(outputSprite.getTexture())

    if (renderer.isOfType('webgl')) {
      renderer.updateTexture(this._texture.getBaseTexture())
    }

    const renderTexture = this._getRenderTexture(sdk)
    const outputBounds = outputSprite.getBounds()
    renderTexture.resizeTo(new Vector2(outputBounds.width, outputBounds.height))

    renderTexture.render(this._container)
    outputSprite.setTexture(renderTexture)

    return Promise.resolve()
  }

  /**
   * Clears the brush canvas
   */
  clearBrushCanvas () {
    if (!this._brushCanvas) return

    const canvas = this._brushCanvas
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * Renders the brush canvas that will be used as a texture in WebGL
   * and as an image in canvas
   * @param {Canvas} canvas
   * @private
   */
  renderBrushCanvas (sdk, canvas = this._brushCanvas) {
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
    this._brushCanvasDirty = false
  }

  /**
   * Creates and adds a new path
   * @param {Number} thickness
   * @param {Color} color
   * @return {BrushOperation.Path}
   */
  createPath (thickness, color) {
    const path = new BrushOperation.Path(this, thickness, color)
    path.on('update', this._onPathUpdate)
    this._options.paths.push(path)
    this.setDirty(true)
    return path
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
  thickness: { type: 'number', default: 10 },
  color: { type: 'color', default: new Color(1, 0, 0, 1) },
  paths: { type: 'array', default: [], setter: function (paths) {
    paths.forEach((path) => {
      path.setDirty(true)
    })
    this._brushCanvasDirty = true
    this.clearBrushCanvas()
    this.setDirty(true)
    return paths
  }}
}

BrushOperation.Path = Path
BrushOperation.ControlPoint = ControlPoint

export default BrushOperation
