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
import Container from '../display/container'

/**
 * A drawable rectangle with a texture
 * @class
 * @extends PhotoEditorSDK.Engine.Container
 * @memberof PhotoEditorSDK.Engine
 */
class Sprite extends Container {
  /**
   * Creates a Sprite
   * @param  {PhotoEditorSDK.Engine.Texture} texture
   */
  constructor (texture) {
    super()

    this._onTextureUpdate = this._onTextureUpdate.bind(this)

    this._texture = texture
    this._shader = null

    // Cached dimensions
    this._width = 0
    this._height = 0

    this._anchor = new Vector2(0, 0)

    this.setTexture(texture)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when this sprite's texture has been updated
   * @private
   */
  _onTextureUpdate () {
    this._boundsNeedUpdate = true
    this._localBoundsNeedUpdate = true
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the contents of this container
   * @param {WebGLRenderer} renderer
   * @private
   */
  _renderWebGL (renderer) {
    renderer.setObjectRenderer(renderer.renderers.sprite)
    renderer.renderers.sprite.render(this)
  }

  /**
   * Renders the contents of this container
   * @param  {CanvasRenderer} renderer
   * @private
   */
  _renderCanvas (renderer) {
    const transform = this._worldTransform
    const textureFrame = this._texture.getFrame()

    const { width, height } = textureFrame
    const pixelRatio = renderer.getPixelRatio()

    // Apply transform
    const dx = this._anchor.x * -width
    const dy = this._anchor.y * -height
    const ctx = renderer.getContext()
    ctx.setTransform(
      transform.a,
      transform.b,
      transform.c,
      transform.d,
      transform.tx * pixelRatio,
      transform.ty * pixelRatio
    )

    const baseTexture = this._texture.getBaseTexture()
    const texturePixelRatio = baseTexture.getPixelRatio()
    ctx.drawImage(
      this._texture.getBaseTexture().getSource(),

      // Source x, y, width, height
      0,
      0,
      width * texturePixelRatio,
      height * texturePixelRatio,

      // Destination x, y, width, height
      dx * pixelRatio,
      dy * pixelRatio,
      width * pixelRatio,
      height * pixelRatio
    )
  }

  // -------------------------------------------------------------------------- PUBLIC API

  /**
   * Returns the non-global bounds of this DisplayObject
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  getLocalBounds () {
    if (this._localBoundsNeedUpdate) {
      const bounds = this._localBounds
      const textureFrame = this._texture.getFrame()

      bounds.x = -textureFrame.width * this._anchor.x
      bounds.y = -textureFrame.height * this._anchor.y
      bounds.width = textureFrame.width
      bounds.height = textureFrame.height

      this._localBoundsNeedUpdate = false
    }
    return this._localBounds.clone()
  }

  /**
   * Returns the bounds for this DisplayObject
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  getBounds () {
    if (this._boundsNeedUpdate) {
      const bounds = this._bounds
      const textureFrame = this._texture.getFrame()

      // @TODO Optimize this (if necessary). We could skip matrix application
      //       when there's no rotation
      const worldTransform = this._worldTransform
      const anchor = this._anchor
      const positions = worldTransform.rectangleToCoordinates(textureFrame, anchor)

      let minX = positions[0].x
      let minY = positions[0].y
      let maxX = minX
      let maxY = minY

      positions.forEach(({x, y}) => {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      })

      bounds.x = minX
      bounds.width = Math.abs(maxX - minX)
      bounds.y = minY
      bounds.height = Math.abs(maxY - minY)

      this._boundsNeedUpdate = false
    }
    return this._bounds.clone()
  }

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  /**
   * Returns the current texture
   * @return {PhotoEditorSDK.Engine.Texture} [description]
   */
  getTexture () { return this._texture }

  /**
   * Sets the texture
   * @param {PhotoEditorSDK.Engine.Texture} texture
   */
  setTexture (texture) {
    if (!texture) return

    if (this._texture) {
      this._texture.off('update', this._onTextureUpdate)
    }

    this._texture = texture
    if (texture.getBaseTexture().isLoaded()) {
      this._onTextureUpdate()
    }
    texture.on('update', this._onTextureUpdate)
  }

  /**
   * Returns the shader
   * @return {PhotoEditorSDK.Engine.Shader}
   */
  getShader () { return this._shader }

  /**
   * Sets the shader
   * @param {PhotoEditorSDK.Engine.Shader} shader
   */
  setShader (shader) { this._shader = shader }

  /**
   * Returns the width
   * @return {Number}
   */
  getWidth () { return this._width }

  /**
   * Sets the width
   * @param {Number} width
   */
  setWidth (width) {
    this._scale.x = width / this._texture.getFrame().width
    this._width = width
    this._boundsNeedUpdate = true
    this._localBoundsNeedUpdate = true
  }

  /**
   * Returns the height
   * @return {Number}
   */
  getHeight () { return this._height }

  /**
   * Sets the height
   * @param {Number} height
   */
  setHeight (height) {
    this._scale.y = height / this._texture.getFrame().height
    this._height = height
    this._boundsNeedUpdate = true
    this._localBoundsNeedUpdate = true
  }

  /**
   * Returns the anchor
   * @return {PhotoEditorSDK.Math.Vector2}
   */
  getAnchor () { return this._anchor }

  /**
   * Sets the anchor
   * @param {PhotoEditorSDK.Math.Vector2} anchor
   */
  setAnchor (anchor, y) {
    if (anchor instanceof Vector2) {
      this._anchor.copy(anchor)
    } else {
      this._anchor.set(anchor, y)
    }
    this._boundsNeedUpdate = true
    this._localBoundsNeedUpdate = true
  }

  /**
   * Disposes this Sprite
   */
  dispose () {
    if (this._texture) {
      this._texture.off('update', this._onTextureUpdate)
    }
  }
}

export default Sprite
