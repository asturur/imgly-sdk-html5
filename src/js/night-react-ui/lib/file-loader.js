/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { EventEmitter } from '../globals'

export default class FileLoader extends EventEmitter {
  constructor (input) {
    super()
    this._input = input
    this._onFileChange = this._onFileChange.bind(this)
    this._input.addEventListener('change', this._onFileChange)
  }

  /**
   * Opens the file dialog
   */
  open () {
    this._input.click()
  }

  /**
   * Loads the file into an image
   * @param  {File} file
   * @private
   */
  _handleFile (file) {
    const reader = new window.FileReader()
    reader.onload = (() => {
      return (e) => {
        const data = e.target.result
        const image = new window.Image()

        image.addEventListener('load', () => {
          this.emit('file', image)
        })

        image.src = data
      }
    })(file)
    reader.readAsDataURL(file)
  }

  /**
   * Gets called when the file input value changes
   * @private
   */
  _onFileChange () {
    const { files } = this._input
    if (!files.length) return

    this._handleFile(files[0])
  }

  /**
   * Disposes all listeners
   */
  dispose () {
    this._input.removeEventListener('change', this._onFileChange)
  }
}
