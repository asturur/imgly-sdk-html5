/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Constants, Engine, Vector2, Color } from '../globals'
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

    this._onOperationUpdate = this._onOperationUpdate.bind(this)
    this._sdk.on(Constants.Events.OPERATION_UPDATED, this._onOperationUpdate)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when a path has been updated
   * @private
   */
  _onPathUpdate () {
    this.setDirty(true, false)
  }

  /**
   * Gets called when an operation is about to be updated. If the crop
   * or rotation operation is updated, this will be recognized and the
   * stickers will be updated accordingly
   * @param  {Operation} operation
   * @param  {Object} options
   * @private
   */
  _onOperationUpdate (operation, options) {
    const { identifier } = operation.constructor

    if (identifier === 'crop' &&
        'start' in options &&
        'end' in options) {
      this._applyCrop(operation, options)
    }

    if (identifier === 'orientation') {
      if ('rotation' in options) {
        this._applyRotation(operation, options)
      }

      if ('flipVertically' in options &&
          operation.getFlipVertically() !== options.flipVertically) {
        this._applyFlip(operation, 'vertical')
      }

      if ('flipHorizontally' in options &&
          operation.getFlipHorizontally() !== options.flipHorizontally) {
        this._applyFlip(operation, 'horizontal')
      }
    }
  }

  // -------------------------------------------------------------------------- UPDATE BY OTHER OPERATION

  /**
   * Applies the given crop change
   * @param  {CropOperation} operation
   * @param  {Object} options
   * @private
   */
  _applyCrop (operation, options) {
    const inputDimensions = this._sdk.getInputDimensions()

    const oldStart = operation.getStart()
    const newStart = options.start

    this._options.paths.forEach((path) => {
      path.forEachControlPoint((controlPoint) => {
        const position = controlPoint.getPosition().clone()
        controlPoint.setPosition(
          position
            .add(
              oldStart.clone().subtract(newStart).multiply(inputDimensions)
            )
        )
      })
    })

    this.setDirty(true, true)
    this.clearBrushCanvas()
  }

  /**
   * Applies the given rotation change
   * @param  {RotationOperation} operation
   * @param  {Object} options
   * @private
   */
  _applyRotation (operation, options) {
    const oldRotation = operation.getRotation()
    const newRotation = options.rotation
    const degreesDifference = newRotation - oldRotation

    const finalDimensions = this._sdk.getFinalDimensions()
    this._options.paths.forEach((path) => {
      path.forEachControlPoint((controlPoint) => {
        const position = controlPoint.getPosition().clone()
        if (degreesDifference === 90 || (oldRotation === 270 && newRotation === 0)) {
          position.flip()
          position.x = finalDimensions.y - position.x
        } else if (degreesDifference === -90 || (oldRotation === -270 && newRotation === 0)) {
          position.flip()
          position.y = finalDimensions.x - position.y
        }
        controlPoint.setPosition(position)
      })
    })

    this.setDirty(true, true)
    this.clearBrushCanvas()
  }

  /**
   * Applies a flip with the given direction
   * @param  {Operation} operation
   * @param  {String} direction
   * @private
   */
  _applyFlip (operation, direction) {
    const rotation = operation.getRotation()
    if (rotation === 90 || rotation === 270) {
      if (direction === 'vertical') {
        direction = 'horizontal'
      } else {
        direction = 'vertical'
      }
    }

    const finalDimensions = this._sdk.getFinalDimensions()
    this._options.paths.forEach((path) => {
      path.forEachControlPoint((controlPoint) => {
        const position = controlPoint.getPosition().clone()
        switch (direction) {
          case 'horizontal':
            position.x = finalDimensions.x - position.x
            break
          case 'vertical':
            position.y = finalDimensions.y - position.y
            break
        }
        controlPoint.setPosition(position)
      })
    })

    this.setDirty(true, true)
    this.clearBrushCanvas()
  }

  // -------------------------------------------------------------------------- RENDERING

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

    this._brushCanvasDirty = true
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

  /**
   * Sets the dirtiness for the given renderer
   * @param {Boolean} dirty
   * @param {BaseRenderer} renderer
   * @param {Boolean} setPathsToDirty = false
   */
  setDirtyForRenderer (dirty, renderer, setPathsToDirty = false) {
    super.setDirtyForRenderer(dirty, renderer)

    if (setPathsToDirty) {
      this._options.paths.forEach((path) => {
        path.setDirty()
      })
    }
  }

  /**
   * Sets the dirtiness for all renderers
   * @param {Boolean} dirty
   * @param {Boolean} setPathsToDirty = false
   */
  setDirty (dirty, setPathsToDirty = false) {
    for (let rendererId in this._dirtiness) {
      this.setDirtyForRenderer(dirty, { id: rendererId }, setPathsToDirty)
    }
  }

  /**
   * Disposes this operation
   */
  dispose () {
    this._sdk.off(Constants.Events.OPERATION_UPDATED, this._onOperationUpdate)
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
    this.clearBrushCanvas()
    this.setDirty(true)
    return paths
  }}
}

BrushOperation.Path = Path
BrushOperation.ControlPoint = ControlPoint

export default BrushOperation
