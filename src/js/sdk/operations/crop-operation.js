/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Constants, Vector2 } from '../globals'
import Operation from './operation'
import Promise from '../vendor/promise'

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias PhotoEditorSDK.Operations.CropOperation
 * @extends PhotoEditorSDK.Operation
 */
class CropOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._sprite.setAnchor(0, 0)

    this._onOperationUpdate = this._onOperationUpdate.bind(this)
    this._sdk.on(Constants.Events.OPERATION_UPDATED, this._onOperationUpdate)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an operation is about to be updated. If the crop
   * or rotation operation is updated, this will be recognized and the
   * crop will be updated accordingly
   * @param  {Operation} operation
   * @param  {Object} options
   * @private
   */
  _onOperationUpdate (operation, options) {
    const { identifier } = operation.constructor

    if (identifier === 'orientation') {
      if ('rotation' in options) {
        this._applyRotation(operation, options)
      }
      if ('flipVertically' in options || 'flipHorizontally' in options) {
        this._applyFlip(operation, options)
      }
    }
  }

  // -------------------------------------------------------------------------- FIXES

  /**
   * Applies the rotation done by an orientation operation
   * @param  {Operation} operation
   * @param  {Object} options
   * @private
   */
  _applyRotation (operation, options) {
    const currentRotation = operation.getRotation()
    const newRotation = options.rotation
    const degreesDifference = newRotation - currentRotation

    let start = this._options.start.clone()
    let end = this._options.end.clone()

    const tempStart = start.clone()
    if (degreesDifference === 90 || degreesDifference === -270) {
      start.set(1.0 - end.y, tempStart.x)
      end.set(1.0 - tempStart.y, end.x)
    } else if (degreesDifference === -90 || degreesDifference === 270) {
      start.set(tempStart.y, 1.0 - end.x)
      end.set(end.y, 1.0 - tempStart.x)
    }

    this.set({ start, end })
  }

  /**
   * Applies the flip done by an orientation operation
   * @param  {Operation} operation
   * @param  {Object} options
   * @private
   */
  _applyFlip (operation, options) {
    // @TODO Implement, make sure all edge cases (like flipping a rotated image) work properly
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Rotates and crops the image using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @override
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    const renderer = sdk.getRenderer()
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)

    this._sprite.setTexture(outputSprite.getTexture())

    const outputBounds = outputSprite.getBounds()
    const outputDimensions = new Vector2(outputBounds.width, outputBounds.height)

    const start = this._options.start.clone()
      .multiply(outputDimensions)
    const end = this._options.end.clone()
      .multiply(outputDimensions)

    const newDimensions = end.clone().subtract(start)
    renderTexture.resizeTo(newDimensions)

    this._sprite.setPosition(-start.x, -start.y)
    renderTexture.render(this._container)
    outputSprite.setTexture(renderTexture)
    this.setDirtyForRenderer(true, renderer)

    return Promise.resolve()
  }

  /**
   * Crops the image using Canvas
   * @param {CanvasRenderer} renderer
   * @return {Promise}
   * @private
   */
  _renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      const canvas = renderer.getCanvas()
      const context = renderer.getContext()

      const newDimensions = this.getNewDimensions(renderer)

      // Clone the canvas
      const tempCanvas = renderer.cloneCanvas()

      canvas.width = newDimensions.x
      canvas.height = newDimensions.y

      const start = this.getStart()
      const end = this.getEnd()
      const size = end.clone()
        .subtract(start)

      context.drawImage(
        tempCanvas,
        start.x * tempCanvas.width, start.y * tempCanvas.height,
        size.x * tempCanvas.width, size.y * tempCanvas.height,
        0, 0,
        size.x * tempCanvas.width, size.y * tempCanvas.height)

      resolve()
    })
  }

  /**
   * Gets the new dimensions
   * @param {Vector2} [dimensions]
   * @return {Vector2}
   */
  getNewDimensions (dimensions) {
    dimensions = dimensions.clone()

    let newDimensions = this._options.end
      .clone()
      .subtract(this._options.start)

    if (this._options.numberFormat === 'relative') {
      newDimensions.multiply(dimensions)
    }

    return newDimensions
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
CropOperation.identifier = 'crop'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
CropOperation.prototype.availableOptions = {
  start: { type: 'vector2', required: true, default: new Vector2(0, 0) },
  end: { type: 'vector2', required: true, default: new Vector2(1, 1) }
}

export default CropOperation
