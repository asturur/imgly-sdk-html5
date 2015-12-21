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

const { EventEmitter, Rectangle } = PhotoEditorSDK

export default class BaseTexture extends EventEmitter {
  constructor (source) {
    super()

    this._onSourceLoaded = this._onSourceLoaded.bind(this)

    this._glTextures = {}
    this._source = source

    this._resolution = 1
    this._loaded = false
    this._frame = new Rectangle(0, 0, 100, 100)

    if (source) {
      this._loadSource()
    }
  }

  /**
   * Loads the source
   * @private
   */
  _loadSource () {
    const source = this._source
    if (source.complete) {
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
    this._update()
  }

  /**
   * Updates the cached dimensions of this BaseTexture's source
   * @private
   */
  _update () {
    this._frame = new Rectangle(0, 0, this._source.width, this._source.height)
    this.emit('update')
  }

  isLoaded () { return this._loaded }
  getSource () { return this._source }
  setSource (source) { this._source = source }
  setGLTextureForId (texture, id) { this._glTextures[id] = texture }
  getGLTextureForId (id) { return this._glTextures[id] }
  getFrame () { return this._frame }
  setFrame (frame) { this._frame = frame }
  getResolution () { return this._resolution }
  setResolution (resolution) { this._resolution = resolution }
}
