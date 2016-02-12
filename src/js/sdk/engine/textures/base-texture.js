/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Rectangle, EventEmitter } from '../globals'

export default class BaseTexture extends EventEmitter {
  constructor (source) {
    super()

    this._onSourceLoaded = this._onSourceLoaded.bind(this)

    this._glTextures = {}
    this._source = source

    this._glUnit = 0
    this._pixelRatio = 1
    this._loaded = false
    this._frame = new Rectangle(0, 0, 100, 100)

    if (source) {
      this._loadSource()
    }
  }

  /**
   * Resizes this BaseTexture to the given dimensions
   * @param  {Vector2} dimensions
   */
  resizeTo (dimensions) {
    this._frame.width = dimensions.x
    this._frame.height = dimensions.y
  }

  /**
   * Loads the source
   * @private
   */
  _loadSource () {
    const source = this._source

    const sourceLoaded = source.complete
    const sourceIsCanvas = source.tagName && source.tagName === 'CANVAS'
    if (sourceLoaded || sourceIsCanvas) {
      return this._onSourceLoaded()
    }

    source.addEventListener('load', this._onSourceLoaded)
  }

  /**
   * Gets called when the source of this BaseTexture has been loaded
   * @private
   */
  _onSourceLoaded () {
    this._loaded = true
    this.emit('loaded')
    this.update()
  }

  /**
   * Updates the cached dimensions of this BaseTexture's source
   */
  update () {
    this._frame = new Rectangle(0, 0, this._source.width, this._source.height)
    this.emit('update')
  }

  /**
   * Disposes the WebGL textures for the given ID
   * @param  {WebGLRenderer} renderer
   */
  disposeGLTextures (renderer) {
    if (renderer.isOfType('webgl')) {
      const gl = renderer.getContext()
      gl.deleteTexture(this._glTextures[gl.id])
      delete this._glTextures[gl.id]
    }
  }

  /**
   * Cleans up this object
   * @param  {WebGLRenderer} renderer
   */
  dispose (renderer) {
    this.disposeGLTextures(renderer)
  }

  isLoaded () { return this._loaded }
  setLoaded (loaded) { this._loaded = loaded }
  getSource () { return this._source }
  setSource (source) { this._source = source }
  setGLTextureForId (texture, id) { this._glTextures[id] = texture }
  getGLTextureForId (id) { return this._glTextures[id] }
  getFrame () { return this._frame }
  setFrame (frame) { this._frame = frame }
  getPixelRatio () { return this._pixelRatio }
  setPixelRatio (pixelRatio) { this._pixelRatio = pixelRatio }
  getGLUnit () { return this._glUnit }
  setGLUnit (glUnit) { this._glUnit = glUnit }
}
