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
import RenderTarget from '../utils/render-target'
import Quad from '../utils/quad'

/**
 * Manages the filters for a {@link PhotoEditorSDK.Engine.WebGLRenderer}
 * @class
 * @memberof PhotoEditorSDK.Engine
 */
/* istanbul ignore next */
class WebGLFilterManager {
  constructor (renderer) {
    this._renderer = renderer
    this._filterStack = [{
      renderTarget: renderer.getCurrentRenderTarget(),
      filters: []
    }]

    this._currentFrame = null
    this._textures = []
    this._textureFrame = new Rectangle(0, 0, renderer.getWidth(), renderer.getHeight())

    this._onContextChange = this._onContextChange.bind(this)
    this._renderer.on('context', this._onContextChange)

    // Initial context
    this._onContextChange()
  }

  /**
   * Resizes this FilterManager and its textures to the given dimensions
   * @param  {PhotoEditorSDK.Math.Vector2} dimensions
   */
  resizeTo (dimensions) {
    this._textureFrame.width = dimensions.x
    this._textureFrame.height = dimensions.y

    this._textures.forEach((texture) => texture.resizeTo(dimensions))
  }

  /**
   * Sets the filter stack to the given stack
   * @param {Object[]} filterStack
   */
  setFilterStack (filterStack) {
    this._filterStack = filterStack
  }

  /**
   * Returns a render target from the pool or creates a new one
   * @param  {Boolean} clear
   * @return {PhotoEditorSDK.Engine.RenderTarget}
   * @private
   */
  _getOrCreateRenderTarget (clear) {
    let renderTarget = this._textures.pop()
    if (!renderTarget) {
      renderTarget = new RenderTarget(this._renderer,
        this._textureFrame.width,
        this._textureFrame.height,
        this._renderer.getPixelRatio())
    }
    renderTarget.setFrame(this._currentFrame)

    if (clear) {
      renderTarget.clear()
    }

    return renderTarget
  }

  /**
   * Pushes the given filters to the
   * @param  {PhotoEditorSDK.Engine.DisplayObject} displayObject
   * @param  {PhotoEditorSDK.Engine.Filter[]} filters
   */
  pushFilters (displayObject, filters) {
    const bounds = displayObject.getBounds()
    this._currentFrame = bounds

    const renderTarget = this._getOrCreateRenderTarget()
    this._renderer.setRenderTarget(renderTarget)
    renderTarget.clear()

    this._filterStack.push({
      renderTarget: renderTarget,
      filters
    })
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

    // Update the Quad's buffers
    this._quad.map(this._textureFrame, inputRenderTarget.getFrame())

    const shader = filters[0].getShaderForRenderer(this._renderer)
    const vertexBuffer = this._quad.getVertexBuffer()
    const indexBuffer = this._quad.getIndexBuffer()

    const gl = this._renderer.getContext()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

    const attributeLocations = shader.getAttributeLocations()
    gl.vertexAttribPointer(attributeLocations.a_position, 2, gl.FLOAT, false, 0, 0)
    gl.vertexAttribPointer(attributeLocations.a_texCoord, 2, gl.FLOAT, false, 0, 2 * 4 * 4)
    gl.vertexAttribPointer(attributeLocations.a_color, 4, gl.FLOAT, false, 0, 4 * 4 * 4)

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
   * @param  {PhotoEditorSDK.Engine.Filter[]} filters
   * @param  {PhotoEditorSDK.Engine.RenderTarget} inputRenderTarget
   * @param  {PhotoEditorSDK.Engine.RenderTarget} outputRenderTarget
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
   * Gets called when the WebGL context has been changed
   * @private
   */
  _onContextChange () {
    this._textures.length = 0
    if (this._renderer.isOfType('webgl')) {
      this._quad = new Quad(this._renderer)
    }
  }

  /**
   * Disposes this WebGLFilterManager
   */
  dispose () {
    this._renderer.off('context', this._onContextChange)
    if (this._quad) {
      this._quad.dispose()
    }
  }
}

export default WebGLFilterManager
