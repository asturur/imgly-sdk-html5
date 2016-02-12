/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Rectangle } from '../globals'
import CanvasBuffer from '../utils/canvas-buffer'

export default class CanvasFilterManager {
  constructor (renderer) {
    this._renderer = renderer
    this._filterStack = [{
      renderTarget: renderer.getCurrentRenderTarget(),
      filters: []
    }]

    this._currentFrame = null
    this._textures = []
    this._textureFrame = new Rectangle(
      0, 0,
      renderer.getWidth(), renderer.getHeight()
    )
  }

  /**
   * Resizes this FilterManager and its textures to the given dimensions
   * @param  {Vector2} dimensions
   */
  resizeTo (dimensions) {
    this._textureFrame.width = dimensions.x
    this._textureFrame.height = dimensions.y

    this._textures.forEach((texture) => texture.resizeTo(dimensions))
  }

  /**
   * Pushes the given filters to the
   * @param  {DisplayObject} displayObject
   * @param  {Array.<Filter>} filters
   */
  pushFilters (displayObject, filters) {
    const bounds = displayObject.getBounds()
    this._currentFrame = bounds

    const renderTarget = this._getOrCreateRenderTarget()
    this._renderer.setRenderTarget(renderTarget)
    this._filterStack.push({ renderTarget, filters })
  }

  /**
   * Removes, applies and returns the last filters from the stack
   * @return {Object}
   */
  popFilters () {
    const { filters, renderTarget } = this._filterStack.pop()
    const lastFilter = this._filterStack[this._filterStack.length - 1]

    const inputRenderTarget = renderTarget
    const outputRenderTarget = lastFilter.renderTarget

    if (filters.length === 1) {
      filters[0].apply(this._renderer, inputRenderTarget, outputRenderTarget)
      this._textures.push(inputRenderTarget)
    } else {
      this._applyFilters(filters, inputRenderTarget, outputRenderTarget)
    }
    return filters
  }

  /**
   * Applies the given filters to the given inputRenderTarget and outputs
   * the filtered content to the outputRenderTarget
   * @param  {Array.<Filter>} filters
   * @param  {CanvasBuffer} inputRenderTarget
   * @param  {CanvasBuffer} outputRenderTarget
   */
  _applyFilters (filters, inputRenderTarget, outputRenderTarget) {
    let flipRenderTarget = inputRenderTarget
    let flopRenderTarget = this._getOrCreateRenderTarget(true)

    const lastFilter = filters[filters.length - 1]
    filters.forEach((filter, i) => {
      const isLastFilter = filter === lastFilter

      if (!isLastFilter) {
        // Render from flip to flop with filter
        filter.apply(this._renderer, flipRenderTarget, flopRenderTarget)

        // Flip the render targets
        let temp = flipRenderTarget
        flipRenderTarget = flopRenderTarget
        flopRenderTarget = temp
      } else {
        // Render to output
        filter.apply(this._renderer, flipRenderTarget, outputRenderTarget)
      }
    })

    // Push the textures back into the texture pool to use them again later
    this._textures.push(flipRenderTarget)
    this._textures.push(flopRenderTarget)
  }

  /**
   * Returns a render target from the pool or creates a new one
   * @param  {Boolean} clear
   * @return {RenderTexture}
   * @private
   */
  _getOrCreateRenderTarget (clear) {
    let renderTarget = this._textures.pop()
    if (!renderTarget) {
      renderTarget = new CanvasBuffer(this._textureFrame.width,
        this._textureFrame.height,
        this._renderer.getPixelRatio())
    }

    if (clear) {
      renderTarget.clear()
    }

    return renderTarget
  }

  /**
   * Sets the filter stack to the given stack
   * @param {Array.<Object>} filterStack
   */
  setFilterStack (filterStack) {
    this._filterStack = filterStack
  }

  /**
   * Disposes this FilterManager
   */
  dispose () {

  }
}
