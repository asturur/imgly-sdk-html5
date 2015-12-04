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

const { EventEmitter } = PhotoEditorSDK

export default class BaseTexture extends EventEmitter {
  constructor (source) {
    super()

    this._onSourceLoaded = this._onSourceLoaded.bind(this)

    this._glTextures = {}
    this._source = source

    this._loaded = false
    this._width = 100
    this._height = 100

    this._loadSource()
  }

  /**
   * Loads the source
   * @private
   */
  _loadSource () {
    const source = this._source
    if (source.loaded) {
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
    this._update()
  }

  /**
   * Updates the cached dimensions of this BaseTexture's source
   * @private
   */
  _update () {
    this._width = this._source.width
    this._height = this._source.height
    this.emit('update')
  }

  isLoaded () { return this._loaded }
  getSource () { return this._source }
  setSource (source) { this._source = source }
  setGLTextureForId (texture, id) { this._glTextures[id] = texture }
  getGLTextureForId (id) { return this._glTextures[id] }
}
