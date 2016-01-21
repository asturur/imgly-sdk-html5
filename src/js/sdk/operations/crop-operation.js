/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2 } from '../globals'
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
  }

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
    if (this.isDirtyForRenderer(renderer)) {
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

      this.setDirtyForRenderer(true, renderer)
    }
    outputSprite.setTexture(renderTexture)

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
   * @param {Renderer} renderer
   * @param {Vector2} [dimensions]
   * @return {Vector2}
   */
  getNewDimensions (renderer, dimensions) {
    let canvas = renderer.getCanvas()
    dimensions = dimensions || new Vector2(canvas.width, canvas.height)

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
