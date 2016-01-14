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

export default class Sprite extends Container {
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
   * Returns the bounds for this DisplayObject
   * @return {Rectangle}
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
      bounds.width = maxX - minX
      bounds.y = minY
      bounds.height = maxY - minY

      this._boundsNeedUpdate = false
    }
    return this._bounds
  }

  /**
   * Gets called when this sprite's texture has been updated
   * @private
   */
  _onTextureUpdate () {
    this._boundsNeedUpdate = true
  }

  /**
   * Sets the texture to the given texture
   * @param {Texture} texture
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

  getTexture () { return this._texture }
  setShader (shader) { this._shader = shader }
  getShader () { return this._shader }
  setWidth (width) {
    this._scale.x = width / this._texture.getFrame().width
    this._width = width
    this._boundsNeedUpdate = true
  }
  getWidth () { return this._width }
  setHeight (height) {
    this._scale.y = height / this._texture.getFrame().height
    this._height = height
    this._boundsNeedUpdate = true
  }
  getHeight () { return this._height }
  getAnchor () { return this._anchor }
  setAnchor (anchor, y) {
    if (anchor instanceof Vector2) {
      this._anchor.copy(anchor)
    } else {
      this._anchor.set(anchor, y)
    }
    this._boundsNeedUpdate = true
  }
}
