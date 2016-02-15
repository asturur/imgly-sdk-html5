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
import RadialBlurFilter from './focus/radial-blur-filter'

/**
 * An operation that can crop out a part of the image
 *
 * @class
 * @alias PhotoEditorSDK.Operations.RadialBlurOperation
 * @extends PhotoEditorSDK.Operation
 */
class RadialBlurOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._lastBlurRadius = this._options.blurRadius
    this._lastGradientRadius = this._options.gradientRadius

    this._horizontalFilter = new RadialBlurFilter()
    this._verticalFilter = new RadialBlurFilter()
    this._sprite.setFilters([
      this._horizontalFilter,
      this._verticalFilter
    ])

    this._horizontalFilter.setDelta(new Vector2(1, 1))
    this._verticalFilter.setDelta(new Vector2(-1, 1))

    this._onOperationUpdate = this._onOperationUpdate.bind(this)
    this._sdk.on(Constants.Events.OPERATION_UPDATED, this._onOperationUpdate)

    this._filter = new RadialBlurFilter()
  }

  /**
   * Gets called when an operation is about to be updated. If the crop
   * or rotation operation is updated, this will be recognized and the
   * blur will be updated accordingly
   * @param  {Operation} operation
   * @param  {Object} options
   * @private
   */
  _onOperationUpdate (operation, options) {
    const { identifier } = operation.constructor

    if (identifier === 'orientation' &&
        'rotation' in options) {
      this._applyRotation(operation, options)
    }

    if (identifier === 'orientation' &&
        ('flipHorizontally' in options || 'flipVertically' in options)) {
      this._applyFlip(operation, options)
    }
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

    const position = this._options.position

    if (degreesDifference === 90 || (oldRotation === 270 && newRotation === 0)) {
      position.flip()
      position.x = 1 - position.x
    } else if (degreesDifference === -90 || (oldRotation === -270 && newRotation === 0)) {
      position.flip()
      position.y = 1 - position.y
    }

    this.set({ position })
  }

  /**
   * Applies the given flip change
   * @param  {RotationOperation} operation
   * @param  {Object} options
   * @private
   */
  _applyFlip (operation, options) {
    if ('flipVertically' in options &&
        operation.getFlipVertically() !== options.flipVertically) {
      this._applyFlipDirection(operation, 'vertical')
    }

    if ('flipHorizontally' in options &&
        operation.getFlipHorizontally() !== options.flipHorizontally) {
      this._applyFlipDirection(operation, 'horizontal')
    }
  }

  /**
   * Applies a flip with the given direction
   * @param  {Operation} operation
   * @param  {String} direction
   * @private
   */
  _applyFlipDirection (operation, direction) {
    const rotation = operation.getRotation()
    if (rotation === 90 || rotation === 270) {
      if (direction === 'vertical') {
        direction = 'horizontal'
      } else {
        direction = 'vertical'
      }
    }

    const position = this._options.position

    switch (direction) {
      case 'horizontal':
        position.x = 1 - position.x
        break
      case 'vertical':
        position.y = 1 - position.y
        break
    }

    this.set({ position })
  }

  /**
   * Crops this image using WebGL
   * @param  {PhotoEditorSDK} sdk
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    const renderer = sdk.getRenderer()
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)

    this._sprite.setTexture(outputSprite.getTexture())
    const spriteBounds = outputSprite.getBounds()
    const outputDimensions = new Vector2(spriteBounds.width, spriteBounds.height)

    // Invert Y
    const position = this._options.position.clone()

    if (this._options.numberFormat === 'relative') {
      position.multiply(outputDimensions)
    }

    const commonOptions = {
      blurRadius: this._options.blurRadius,
      gradientRadius: this._options.gradientRadius,
      position: position,
      texSize: outputDimensions
    }

    this._horizontalFilter.set(commonOptions)
    this._verticalFilter.set(commonOptions)

    const bounds = this._sprite.getBounds()
    renderTexture.resizeTo(new Vector2(bounds.width, bounds.height))

    renderTexture.render(this._container)
    outputSprite.setTexture(renderTexture)
    this.setDirtyForRenderer(false, renderer)

    return Promise.resolve()
  }

  /**
   * Renders the radial blur using Canvas2D
   * @param  {PhotoEditorSDK} sdk
   */
  _renderCanvas (sdk) {
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)

    const { blurRadius, gradientRadius, position } = this._options
    this._filter.set({
      blurRadius, gradientRadius, position,
      texSize: sdk.getOutputDimensions()
    })

    this._sprite.setTexture(outputSprite.getTexture())
    this._sprite.setFilters([
      this._filter
    ])

    renderTexture.render(this._container)
    outputSprite.setTexture(renderTexture)

    return Promise.resolve()
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
RadialBlurOperation.identifier = 'radial-blur'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
RadialBlurOperation.prototype.availableOptions = {
  position: { type: 'vector2', default: new Vector2(0.5, 0.5) },
  gradientRadius: { type: 'number', default: 50 },
  blurRadius: { type: 'number', default: 20 }
}

export default RadialBlurOperation
