/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Constants, Vector2 } from '../globals'
import Operation from './operation'
import Promise from '../vendor/promise'
import LinearFocusFilter from './focus/linear-focus-filter'

/**
 * An operation that can draw a linear focus
 * @class
 * @extends PhotoEditorSDK.Operation
 * @memberof PhotoEditorSDK.Operations
 */
class LinearFocusOperation extends Operation {
  /**
   * Creates a new LinearFocusOperation
   * @param  {PhotoEditorSDK} sdk
   * @param  {Object} [options]
   */
  constructor (...args) {
    super(...args)

    this._lastBlurRadius = this._options.blurRadius
    this._lastSize = this._options.size
    this._lastGradientSize = this._options.gradientSize

    this._horizontalFilter = new LinearFocusFilter()
    this._verticalFilter = new LinearFocusFilter()
    this._sprite.setFilters([
      this._horizontalFilter,
      this._verticalFilter
    ])

    this._horizontalFilter.setDelta(new Vector2(1, 1))
    this._verticalFilter.setDelta(new Vector2(-1, 1))

    this._onOperationUpdate = this._onOperationUpdate.bind(this)
    this._sdk.on(Constants.Events.OPERATION_UPDATED, this._onOperationUpdate)

    this._filter = new LinearFocusFilter()
  }

  /**
   * Gets called when an operation is about to be updated. If the crop
   * or rotation operation is updated, this will be recognized and the
   * blur will be updated accordingly
   * @param  {PhotoEditorSDK.Operation} operation
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
   * @param  {PhotoEditorSDK.Operations.RotationOperation} operation
   * @param  {Object} options
   * @private
   */
  _applyRotation (operation, options) {
    const oldRotation = operation.getRotation()
    const newRotation = options.rotation
    const degreesDifference = newRotation - oldRotation

    const start = this._options.start
    const end = this._options.end

    if (degreesDifference === 90 || (oldRotation === 270 && newRotation === 0)) {
      start.flip()
      start.x = 1 - start.x
      end.flip()
      end.x = 1 - end.x
    } else if (degreesDifference === -90 || (oldRotation === -270 && newRotation === 0)) {
      start.flip()
      start.y = 1 - start.y
      end.flip()
      end.y = 1 - end.y
    }

    this.set({ start, end })
  }

  /**
   * Applies the given flip change
   * @param  {PhotoEditorSDK.Operations.RotationOperation} operation
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
   * @param  {PhotoEditorSDK.Operation} operation
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

    const start = this._options.start
    const end = this._options.end

    switch (direction) {
      case 'horizontal':
        start.x = 1 - start.x
        end.x = 1 - end.x
        break
      case 'vertical':
        start.y = 1 - start.y
        end.y = 1 - end.y
        break
    }

    this.set({ start, end })
  }

  /**
   * Crops this image using WebGL
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

    const spriteBounds = outputSprite.getBounds()
    const outputDimensions = new Vector2(spriteBounds.width, spriteBounds.height)

    const start = this._options.start.clone()
    const end = this._options.end.clone()

    start.multiply(outputDimensions)
    end.multiply(outputDimensions)

    const { blurRadius, size, gradientSize } = this._options
    const commonOptions = {
      blurRadius, size, gradientSize,

      start,
      end,
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
   * @override
   * @private
   */
  _renderCanvas (sdk) {
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)

    const { blurRadius, size, gradientSize, start, end } = this._options
    this._filter.set({
      blurRadius, gradientSize, size, start, end,
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
 * @default
 */
LinearFocusOperation.identifier = 'linear-focus'

/**
 * Specifies the available options for this operation
 * @type {Object}
 * @ignore
 */
LinearFocusOperation.prototype.availableOptions = {
  start: { type: 'vector2', default: new Vector2(0.0, 0.5) },
  end: { type: 'vector2', default: new Vector2(1.0, 0.5) },
  blurRadius: { type: 'number', default: 30 },
  size: { type: 'number', default: 50 },
  gradientSize: { type: 'number', default: 50 }
}

export default LinearFocusOperation
