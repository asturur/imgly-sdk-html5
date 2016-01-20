/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine } from '../globals'
import Promise from '../vendor/promise'
import Vector2 from '../lib/math/vector2'
import Operation from './operation'

/**
 * An operation that can rotate and flip an image
 *
 * @class
 * @alias PhotoEditorSDK.Operations.OrientationOperation
 * @extends PhotoEditorSDK.Operation
 */
class OrientationOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._sprite = new Engine.Sprite()
    this._container = new Engine.Container()
    this._container.addChild(this._sprite)
  }

  /**
   * Rotates the image using WebGL
   * @param  {PhotoEditorSDK} sdk
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    const renderer = sdk.getRenderer()
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)

    if (this.isDirtyForRenderer(renderer)) {
      const actualDegrees = this._options.rotation % 360
      const radians = actualDegrees * (Math.PI / 180)

      this._sprite.setScale(
        this._options.flipHorizontally ? -1 : 1,
        this._options.flipVertically ? -1 : 1
      )
      this._sprite.setRotation(radians)
      this._sprite.setAnchor(0.5, 0.5)
      this._sprite.setTexture(outputSprite.getTexture())
      this._sprite.updateTransform()

      const bounds = this._sprite.getBounds()
      renderTexture.resizeTo(new Vector2(bounds.width, bounds.height))
      renderTexture.render(this._container)

      // Make sure we're rendering to top left corner
      this._sprite.setPosition(renderTexture.getWidth() / 2, renderTexture.getHeight() / 2)

      // Draw
      renderTexture.render(this._container)

      this.setDirtyForRenderer(false, renderer)
    }

    outputSprite.setTexture(renderTexture)
    return Promise.resolve()
  }

  /**
   * Returns the dimensions that an image with the given `dimensions`
   * would have after this operation has been applied
   * @param  {Vector2} dimensions
   * @return {Vector2}
   */
  getNewDimensions (dimensions) {
    dimensions = dimensions.clone()
    if (this._options.rotation % 180) {
      dimensions.flip()
    }
    return dimensions
  }

  /**
   * Crops the image using Canvas2D
   * @param  {PhotoEditorSDK} sdk
   * @return {Promise}
   * @private
   */
  _renderCanvas (sdk) {
    return new Promise((resolve, reject) => {
      const canvas = sdk.getCanvas()
      const context = sdk.getContext()
      const actualDegrees = this._options.rotation % 360
      const radians = actualDegrees * Math.PI / 180

      const pixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1
      const canvasDimensions = new Vector2(canvas.width, canvas.height)
        .divide(pixelRatio)
      const newDimensions = this.getNewDimensions(sdk, canvasDimensions)

      // Clone the canvas
      const tempCanvas = sdk.cloneCanvas()

      let scaleX = 1
      let scaleY = 1
      let translateX = 0
      let translateY = 0

      if (this._options.flipHorizontally) {
        scaleX = -1
        translateX = canvas.width
      }

      if (this._options.flipVertically) {
        scaleY = -1
        translateY = canvas.height
      }

      sdk.resizeTo(newDimensions)
      context.save()
      context.translate(canvas.width / 2, canvas.height / 2)
      context.rotate(radians)
      context.scale(scaleX, scaleY)
      context.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2)
      context.restore()

      resolve()
    })
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
OrientationOperation.identifier = 'orientation'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
OrientationOperation.prototype.availableOptions = {
  rotation: { type: 'number', default: 0, validation: function (value) {
    if (value % 90 !== 0) {
      throw new Error('OrientationOperation: `rotation` has to be a multiple of 90.')
    }
  }},
  flipVertically: { type: 'boolean', default: false },
  flipHorizontally: { type: 'boolean', default: false }
}

export default OrientationOperation
