/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Promise, Engine, Vector2, Color } from '../globals'
import Operation from './operation'

class BorderFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../shaders/operations/border.frag')
  }

  /**
   * Applies this filter to the given inputTarget and renders it to
   * the given outputTarget using the CanvasRenderer
   * @param  {CanvasRenderer} renderer
   * @param  {RenderTarget} inputTarget
   * @param  {RenderTarget} outputTarget
   * @param  {Boolean} clear = false
   * @private
   */
  _applyCanvas (renderer, inputTarget, outputTarget, clear = false) {
    const canvas = inputTarget.getCanvas()
    const outputContext = outputTarget.getContext()

    const { color, thickness } = this._options

    outputContext.save()
    outputContext.drawImage(canvas, 0, 0)
    outputContext.beginPath()
    outputContext.lineWidth = thickness * 2
    outputContext.strokeStyle = color.toRGBA()
    outputContext.rect(0, 0, canvas.width, canvas.height)
    outputContext.stroke()
    outputContext.restore()
  }
}

BorderFilter.prototype.availableOptions = {
  color: { type: 'color', default: Color.BLACK, uniformType: '4f' },
  thickness: { type: 'number', default: 0, uniformType: 'f' },
  textureSize: { type: 'vector2', default: new Vector2(0, 0), uniformType: '2f' }
}

/**
 * An operation that can draw a border around the canvas
 * @class
 * @extends PhotoEditorSDK.Operation
 * @memberof PhotoEditorSDK.Operations
 */
class BorderOperation extends Operation {
  /**
   * Creates a new BorderOperation
   * @param  {PhotoEditorSDK} sdk
   * @param  {Object} [options]
   */
  constructor (...args) {
    super(...args)

    this._filter = new BorderFilter()
    this._sprite.setFilters([this._filter])
  }

  /**
   * Renders the border operation
   * @param  {PhotoEditorSDK} sdk
   * @private
   */
  _render (sdk) {
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)
    const renderer = sdk.getRenderer()

    this._sprite.setTexture(outputSprite.getTexture())

    const spriteBounds = outputSprite.getBounds()
    const spriteDimensions = new Vector2(spriteBounds.width, spriteBounds.height)

    renderTexture.resizeTo(spriteDimensions)

    const { color, thickness } = this._options

    // Update uniforms
    this._filter.set({
      color,
      thickness,
      textureSize: spriteDimensions
    })

    renderTexture.render(this._container)
    outputSprite.setTexture(renderTexture)
    this.setDirtyForRenderer(false, renderer)

    return Promise.resolve()
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
BorderOperation.identifier = 'border'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
BorderOperation.prototype.availableOptions = {
  color: { type: 'color', default: new Color(0, 0, 0, 1) },
  thickness: { type: 'number', default: 5 }
}

export default BorderOperation
