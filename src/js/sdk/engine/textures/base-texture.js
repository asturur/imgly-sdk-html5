/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Rectangle, EventEmitter } from '../globals'

/**
 * A BaseTexture holds and handles the raw source of a texture
 * @class
 * @extends EventEmitter
 * @memberof PhotoEditorSDK.Engine
 */
class BaseTexture extends EventEmitter {
  /**
   * Creates a BaseTexture
   * @param  {*} source
   */
  constructor (source) {
    super()

    this._onSourceLoaded = this._onSourceLoaded.bind(this)

    this._glTextures = {}
    this._source = source

    this._glUnit = 0
    this._magFilter = BaseTexture.LinearFilter
    this._minFilter = BaseTexture.LinearFilter
    this._pixelRatio = 1
    this._loaded = false
    this._frame = new Rectangle(0, 0, 100, 100)

    if (source) {
      this._loadSource()
    }
  }

  /**
   * Resizes this BaseTexture to the given dimensions
   * @param  {PhotoEditorSDK.Math.Vector2} dimensions
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
   * Returns the filter for the given direction from the given WebGL context
   * @param  {WebGLRenderingContext} gl
   * @param  {String} minOrMag
   * @return {Number}
   */
  getGLFilter (gl, minOrMag) {
    const filter = (value) => {
      switch (value) {
        case BaseTexture.LinearFilter:
          return gl.LINEAR
        case BaseTexture.NearestFilter:
          return gl.NEAREST
      }
    }

    switch (minOrMag) {
      case 'min':
        return filter(this._minFilter)
      case 'mag':
        return filter(this._magFilter)
    }
  }

  /**
   * Checks if this BaseTexture has been loaded
   * @return {Boolean}
   */
  isLoaded () { return this._loaded }

  /**
   * Sets the loaded state
   * @param {Boolean} loaded
   */
  setLoaded (loaded) { this._loaded = loaded }

  /**
   * Returns the source
   * @return {*} s
   */
  getSource () { return this._source }

  /**
   * Sets the source
   * @param {*} source
   */
  setSource (source) { this._source = source }

  /**
   * Returns the WebGL texture for the given renderer ID
   * @param  {Number} id
   * @return {WebGLTexture}
   */
  getGLTextureForId (id) { return this._glTextures[id] }

  /**
   * Sets the WebGLTexture for the given renderer ID
   * @param {WebGLTexture} texture
   * @param {Number} id
   */
  setGLTextureForId (texture, id) { this._glTextures[id] = texture }

  /**
   * Returns the frame
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  getFrame () { return this._frame }

  /**
   * Sets the frame
   * @param {PhotoEditorSDK.Math.Rectangle} frame
   */
  setFrame (frame) { this._frame = frame }

  /**
   * Returns the pixel ratio
   * @return {Number}
   */
  getPixelRatio () { return this._pixelRatio }

  /**
   * Sets the pixel ratio
   * @param {Number} pixelRatio
   */
  setPixelRatio (pixelRatio) { this._pixelRatio = pixelRatio }

  /**
   * Returns the WebGL texture unit
   * @return {Number}
   */
  getGLUnit () { return this._glUnit }

  /**
   * Sets the WebGL texture unit
   * @param {Number} glUnit
   */
  setGLUnit (glUnit) { this._glUnit = glUnit }

  /**
   * Sets the min filter to the given one
   * @param {Number} minFilter
   */
  setMinFilter (minFilter) { this._minFilter = minFilter }

  /**
   * Returns this texture's min filter
   * @return {Number}
   */
  getMinFilter () { return this._minFilter }


  /**
   * Sets the mag filter to the given one
   * @param {Number} magFilter
   */
  setMagFilter (magFilter) { this._magFilter = magFilter }

  /**
   * Returns this texture's mag filter
   * @return {Number}
   */
  getMagFilter () { return this._magFilter }

  /**
   * Disposes the WebGL textures for the given renderer ID
   * @param  {PhotoEditorSDK.Engine.WebGLRenderer} renderer
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
   * @param  {PhotoEditorSDK.Engine.WebGLRenderer} renderer
   */
  dispose (renderer) {
    this.disposeGLTextures(renderer)
  }
}

BaseTexture.NearestFilter = 0
BaseTexture.LinearFilter = 0

export default BaseTexture
