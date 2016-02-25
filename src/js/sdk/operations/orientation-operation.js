/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
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
 * @class
 * @extends PhotoEditorSDK.Operation
 * @memberof PhotoEditorSDK.Operations
 */
class OrientationOperation extends Operation {
  /**
   * Creates a new OrientationOperation
   * @param  {PhotoEditorSDK} sdk
   * @param  {Object} [options]
   */
  constructor (...args) {
    super(...args)

    this._sprite = new Engine.Sprite()
    this._container = new Engine.Container()
    this._container.addChild(this._sprite)
  }

  /**
   * Rotates and/or flips the image
   * @param  {PhotoEditorSDK} sdk
   * @returns {Promise}
   * @override
   * @private
   */
  _render (sdk) {
    const renderer = sdk.getRenderer()
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)

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

    // Make sure we're rendering to top left corner
    this._sprite.setPosition(renderTexture.getWidth() / 2, renderTexture.getHeight() / 2)

    // Draw
    renderTexture.render(this._container)
    outputSprite.setTexture(renderTexture)
    this.setDirtyForRenderer(false, renderer)

    return Promise.resolve()
  }

  /**
   * Returns the dimensions the given dimensions will have after this operation
   * has been applied
   * @param {PhotoEditorSDK.Math.Vector2} dimensions
   * @return {PhotoEditorSDK.Math.Vector2}
   * @override
   */
  getNewDimensions (dimensions) {
    dimensions = dimensions.clone()
    if (this._options.rotation % 180) {
      dimensions.flip()
    }
    return dimensions
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 * @default
 */
OrientationOperation.identifier = 'orientation'

/**
 * Specifies the available options for this operation
 * @type {Object}
 * @ignore
 */
OrientationOperation.prototype.availableOptions = {
  rotation: { type: 'number', default: 0, validation: function (value) {
    if (value % 90 !== 0) {
      throw new Error('OrientationOperation: `rotation` has to be a multiple of 90.')
    }
  }, setter: (value) => value % 360 },
  flipVertically: { type: 'boolean', default: false },
  flipHorizontally: { type: 'boolean', default: false }
}

export default OrientationOperation
