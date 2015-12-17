/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Container from '../display/container'

const { Vector2 } = PhotoEditorSDK

export default class Sprite extends Container {
  constructor (texture) {
    super()

    this._onTextureUpdate = this._onTextureUpdate.bind(this)

    this._texture = texture
    this._shader = null

    // Cached dimensions
    this._width = 0
    this._height = 0

    this._anchor = new Vector2(0.5, 0.5)

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
   * Gets called when this sprite's texture has been updated
   * @private
   */
  _onTextureUpdate () {

  }

  setTexture (texture) {
    this._texture = texture
    if (texture.getBaseTexture().isLoaded()) {
      this._onTextureUpdate()
    } else {
      texture.once('update', this._onTextureUpdate)
    }
  }

  getTexture () { return this._texture }
  setShader (shader) { this._shader = shader }
  getShader () { return this._shader }
  setWidth (width) { this._width = width }
  getWidth () { return this._width }
  setHeight (height) { this._height = height }
  getHeight () { return this._height }
  getAnchor () { return this._anchor }
  setAnchor (anchor, y) {
    if (anchor instanceof Vector2) {
      this._anchor.copy(anchor)
    } else {
      this._anchor.set(anchor, y)
    }
  }
}
