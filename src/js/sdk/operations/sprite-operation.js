/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Constants, Engine, Vector2 } from '../globals'
import Operation from './operation'

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
    this._onSpriteUpdate = this._onSpriteUpdate.bind(this)
    this._sdk.on(Constants.Events.OPERATION_UPDATED, this._onOperationUpdate)

    this._container = new Engine.Container()
    this._inputSprite = new Engine.Sprite()
    this._container.addChild(this._inputSprite)
  }

  /**
   * Returns the sprites that are instances of the given class
   * @param  {Class} Klass
   * @return {Array.<Sprite>}
   * @todo   Do we still need this?
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

    this._options.sprites.forEach((sprite) => {
      sprite.applyFlip(direction)
    })
  }

  /**
   * Gets called when a sprite is flagged as dirty / its options changed
   * @param  {Sprite} sprite
   * @param  {Object} options
   * @private
   */
  _onSpriteUpdate (sprite, options) {
    this.setDirty(true)
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

    this._options.sprites.forEach((sprite) => {
      // Update sprite rotation
      let spriteDegrees = sprite.getRotation() * 180 / Math.PI
      spriteDegrees += degreesDifference
      sprite.setRotation(spriteDegrees * Math.PI / 180)

      // Flip X and Y unless we're rotating by 180 degrees
      const spritePosition = sprite.getPosition().clone()
      if (degreesDifference === 90 || (oldRotation === 270 && newRotation === 0)) {
        spritePosition.flip()
        spritePosition.x = 1 - spritePosition.x
      } else if (degreesDifference === -90 || (oldRotation === -270 && newRotation === 0)) {
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
    const inputDimensions = this._sdk.getInputDimensions()

    const oldEnd = operation.getEnd()
    const oldStart = operation.getStart()
    const newEnd = options.end
    const newStart = options.start

    const oldDimensions = oldEnd.clone().subtract(oldStart)
      .multiply(inputDimensions)
    const newDimensions = newEnd.clone().subtract(newStart)
      .multiply(inputDimensions)

    this._options.sprites.forEach((sprite) => {
      const position = sprite.getPosition().clone()
      sprite.set({
        position: position
          .add(
            oldStart.clone().subtract(newStart)
          )
          .divide(
            newDimensions.clone().divide(oldDimensions)
          )
      }, false)
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
   * Gets called when a sprite has been added
   * @param {Sprite} sprite
   */
  addSprite (sprite) {
    this._options.sprites.push(sprite)
    this._container.addChild(sprite.getDisplayObject())

    // This operation needs to be rerendered
    this.setDirty(true)

    sprite.on('update', this._onSpriteUpdate)
  }

  /**
   * Removes the given sprite from the list of sprites
   * @param  {Sprite} sprite
   * @return {Boolean}
   */
  removeSprite (sprite) {
    const sprites = this._options.sprites
    const index = sprites.indexOf(sprite)
    if (index !== -1) {
      sprite.off('update', this._onSpriteUpdate)
      this._container.removeChild(sprite.getDisplayObject())

      sprites.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Renders this operation using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)

    this._inputSprite.setTexture(outputSprite.getTexture())

    const container = this._container
    const sprites = this._options.sprites

    const outputBounds = outputSprite.getBounds()
    renderTexture.resizeTo(new Vector2(outputBounds.width, outputBounds.height))

    sprites.forEach((sprite) => {
      sprite.update(sdk)
    })

    renderTexture.clear()
    renderTexture.render(container)
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
    const zoom = sdk.getZoom()

    let sprites = this._options.sprites.slice(0).reverse()
    if (type) {
      sprites = sprites.filter((s) => s instanceof type)
    }

    sprites.forEach((sprite) => {
      if (intersectingSprite) return

      const displayObject = sprite.getDisplayObject()
      const stickerBounds = displayObject.getLocalBounds()
      const stickerScale = displayObject.getScale().x
      const stickerPosition = displayObject.getPosition()
      const stickerRotation = sprite.getRotation()

      const relativeClickPosition = position
        .clone()
        .subtract(stickerPosition.x * zoom, stickerPosition.y * zoom)

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
      const pivot = sprite.getPivot()

      if (x > -pivot.x * stickerDimensions.x &&
          x < (1 - pivot.x) * stickerDimensions.x &&
          y > -pivot.y * stickerDimensions.y &&
          y < (1 - pivot.y) * stickerDimensions.y) {
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
