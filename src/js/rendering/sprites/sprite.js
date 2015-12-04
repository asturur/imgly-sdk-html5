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

export default class Sprite extends Container {
  constructor (texture) {
    super()

    this._texture = texture
    this._shader = null
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

  setTexture (texture) { this._texture = texture }
  getTexture () { return this._texture }
  setShader (shader) { this._shader = shader }
  getShader () { return this._shader }
}
