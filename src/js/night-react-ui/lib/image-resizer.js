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

import { Promise, Vector2 } from '../globals'

export default class ImageResizer {
  constructor (image, maxPixels, maxDimensions) {
    this._image = image
    this._maxPixels = maxPixels
    this._maxDimensions = maxDimensions
  }

  /**
   * Checks if the image needs to be resized
   * @return {Boolean}
   */
  needsResize () {
    const dimensions = new Vector2(this._image.width, this._image.height)
    const pixels = dimensions.x * dimensions.y

    return pixels > this._maxPixels ||
      dimensions.x > this._maxDimensions ||
      dimensions.y > this._maxDimensions
  }

  /**
   * Resizes the image to match the maximum amount of pixels
   * @return {Promise}
   */
  resize () {
    let reason = null
    const maxDimensions = this._maxDimensions
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const maxPixelsDimensions = this._getDimensionsByMaxPixels()
        let dimensions = maxPixelsDimensions.clone()
        reason = 'maxMegaPixels'

        if (maxDimensions !== null &&
            (dimensions.x > maxDimensions ||
            dimensions.y > maxDimensions)) {
          let scale = Math.min(
            maxDimensions / dimensions.x,
            maxDimensions / dimensions.y
          )
          dimensions.multiply(scale)
          reason = 'maxDimensions'
        }

        dimensions.floor()

        const canvas = this._createResizedImageCanvas(dimensions)
        resolve({ canvas, dimensions, reason })
      }, 1000)
    })
  }

  /**
   * Creates a resized canvas with the given dimensions
   * @param  {Vector2} dimensions
   * @return {Canvas}
   * @private
   */
  _createResizedImageCanvas (dimensions) {
    const image = this._image

    const canvas = document.createElement('canvas')
    canvas.width = dimensions.x
    canvas.height = dimensions.y

    const context = canvas.getContext('2d')
    context.drawImage(image,
      0, 0,
      image.width, image.height,
      0, 0,
      dimensions.x, dimensions.y)
    return canvas
  }

  /**
   * Returns the dimensions that match the max pixel count
   * @return {Vector2}
   * @private
   */
  _getDimensionsByMaxPixels () {
    const image = this._image
    const maxPixels = this._maxPixels

    const ratioHV = image.width / image.height
    const ratioVH = image.height / image.width

    return new Vector2(
      Math.sqrt(maxPixels * ratioHV),
      Math.sqrt(maxPixels * ratioVH)
    ).floor()
  }
}
