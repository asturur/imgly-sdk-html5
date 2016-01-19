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
import Operation from './operation'
import Vector2 from '../lib/math/vector2'

import Sprite from './sprites/sprite'
import Sticker from './sprites/sticker'
import Text from './sprites/text'

/**
 * An operation that can draw sprites (text and stickers) on the canvas
 *
 * @class
 * @alias PhotoEditorSDK.Operations.SpriteOperation
 * @extends PhotoEditorSDK.Operation
 */
class SpriteOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._renderers = {}

    this._onOperationUpdate = this._onOperationUpdate.bind(this)
    this._sdk.on('operation-update', this._onOperationUpdate)

    this._container = new Engine.Container()
    this._inputSprite = new Engine.Sprite()
    this._container.addChild(this._inputSprite)
  }

  /**
   * Returns the sprites that are instances of the given class
   * @param  {Class} Klass
   * @return {Array.<Sprite>}
   */
  getSpritesOfType (Klass) {
    return this._options.sprites.filter((sprite) =>
      sprite instanceof Klass
    )
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

    if (identifier === 'rotation' &&
        'degrees' in options) {
      this._applyRotation(operation, options)
    }
  }

  /**
   * Applies the given rotation change
   * @param  {RotationOperation} operation
   * @param  {Object} options
   * @private
   */
  _applyRotation (operation, options) {
    const oldDegrees = operation.getDegrees()
    const newDegrees = options.degrees
    const degreesDifference = newDegrees - oldDegrees

    this._options.sprites.forEach((sprite) => {
      let spriteDegrees = sprite.getRotation() * 180 / Math.PI
      spriteDegrees += degreesDifference
      sprite.setRotation(spriteDegrees * Math.PI / 180)

      // Flip X and Y unless we're rotating by 180 degrees
      const spritePosition = sprite.getPosition()
      if (degreesDifference === 90 || (oldDegrees === 270 && newDegrees === 0)) {
        spritePosition.flip()
        spritePosition.x = 1 - spritePosition.x
      } else if (degreesDifference === -90 || (oldDegrees === -270 && newDegrees === 0)) {
        spritePosition.flip()
        spritePosition.y = 1 - spritePosition.y
      }
      sprite.setPosition(spritePosition)
    })
  }

  /**
   * Applies the given crop change
   * @param  {CropOperation} operation
   * @param  {Object} options
   * @private
   */
  _applyCrop (operation, options) {
    const inputDimensions = this._kit.getInputDimensions()

    const oldEnd = operation.getEnd()
    const oldStart = operation.getStart()
    const newEnd = options.end
    const newStart = options.start

    const oldDimensions = oldEnd.clone().subtract(oldStart)
      .multiply(inputDimensions)
    const newDimensions = newEnd.clone().subtract(newStart)
      .multiply(inputDimensions)

    this._options.sprites.forEach((sprite) => {
      const position = sprite.getPosition()
      const scale = sprite.getScale()

      sprite.set({
        position: position.clone()
          .add(
            oldStart.clone().subtract(newStart)
          )
          .divide(
            newDimensions.clone().divide(oldDimensions)
          ),
        scale: scale.clone()
          .multiply(oldDimensions.x / newDimensions.x)
      })
    })
  }

  /**
   * Returns a serialized version of the given option
   * @param {String} optionName
   * @return {*} optionName
   * @private
   */
  _serializeOption (optionName) {
    // Since `sprites` is an array of configurables, we need
    // to serialize them as well
    if (optionName === 'sprites') {
      return this._options.sprites.map((sprite) => {
        return sprite.serializeOptions()
      })
    }
    return super._serializeOption(optionName)
  }

  /**
   * Creates a new sticker object and returns it
   * @param  {Object} options
   * @return {Sticker}
   */
  createSticker (options) {
    return new Sticker(this, options)
  }

  /**
   * Creates a new sticker object and returns it
   * @param  {Object} options
   * @return {Text}
   */
  createText (options) {
    return new Text(this, options)
  }

  /**
   * Renders this operation using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    const renderer = sdk.getRenderer()
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)

    this._inputSprite.setTexture(outputSprite.getTexture())

    if (this.isDirtyForRenderer(renderer)) {
      const container = this._container
      const sprites = this._options.sprites

      sprites.forEach((sprite) => {
        const renderableSprite = sprite.getSprite()
        if (!container.hasChild(renderableSprite)) {
          container.addChild(renderableSprite)
        }

        sprite.update(sdk)
      })

      renderTexture.clear()
      renderTexture.render(container)
    }

    outputSprite.setTexture(renderTexture)
    return Promise.resolve()
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @param  {Image} image
   * @private
   */
  _renderCanvas (renderer, image) {
    // if (!this._renderers[renderer.id]) {
    //   this._renderers[renderer.id] = new StickerCanvasRenderer(this, renderer)
    // }

    return this._renderers[renderer.id].render()
  }

  /**
   * Returns the sprite at the given position on the canvas
   * @param  {SDK} sdk
   * @param  {Vector2} position
   * @param  {Class} [type]
   * @return {Sprite}
   */
  getSpriteAtPosition (sdk, position, type) {
    let intersectingSprite = null
    const outputSprite = sdk.getSprite()
    const outputBounds = outputSprite.getBounds()
    const zoom = sdk.getZoom()

    let sprites = this._options.sprites.slice(0).reverse()
    if (type) {
      sprites = sprites.filter((s) => s instanceof type)
    }

    sprites.forEach((sprite) => {
      if (intersectingSprite) return

      const stickerBounds = sprite.getSprite().getLocalBounds()
      const stickerScale = sprite.getSprite().getScale().x
      const stickerPosition = sprite.getSprite().getPosition()
      const stickerRotation = sprite.getRotation()

      const relativeClickPosition = position
        .clone()
        .subtract(stickerPosition.x * zoom, stickerPosition.y * zoom)
        .subtract(outputBounds.x, outputBounds.y)

      const clickDistance = relativeClickPosition.len()
      const radians = Math.atan2(
        relativeClickPosition.y,
        relativeClickPosition.x
      )
      const newRadians = radians - stickerRotation

      const x = Math.cos(newRadians) * clickDistance
      const y = Math.sin(newRadians) * clickDistance

      const stickerDimensions = new Vector2(
        stickerBounds.width, stickerBounds.height
      ).multiply(zoom).multiply(Math.abs(stickerScale))

      if (x > -0.5 * stickerDimensions.x &&
          x < 0.5 * stickerDimensions.x &&
          y > -0.5 * stickerDimensions.y &&
          y < 0.5 * stickerDimensions.y) {
        intersectingSprite = sprite
      }
    })
    return intersectingSprite
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
SpriteOperation.identifier = 'sprite'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
SpriteOperation.prototype.availableOptions = {
  sprites: {
    type: 'array', default: [],
    setter: function (sprites) {
      sprites = sprites.map((sprite, i) => {
        if (sprite instanceof Sprite) return sprite

        // Update and return sprites if they already exist
        if (this._options.sprites[i]) {
          this._options.sprites[i].set(sprite)
          return this._options.sprites[i]
        }

        // Create sprite from the given _options
        switch (sprite.type) {
          case 'text':
            return new Text(this, sprite)
          case 'sticker':
            return new Sticker(this, sprite)
        }
      })
      return sprites
    }
  }
}

export default SpriteOperation
