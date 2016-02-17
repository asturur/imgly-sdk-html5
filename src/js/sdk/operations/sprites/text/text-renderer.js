/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine, Vector2 } from '../../../globals'
import TextSplitter from './text-splitter'

export default class TextRenderer {
  constructor (text, operation) {
    this._text = text
    this._operation = operation

    this._createCanvas()
    this._createTexture()
  }

  /**
   * Creates the canvas and initializes the text splitter
   * @private
   */
  _createCanvas () {
    this._canvas = document.createElement('canvas')
    this._context = this._canvas.getContext('2d')
    this._textSplitter = new TextSplitter(this._context)
  }

  /**
   * Creates the texture
   * @private
   */
  _createTexture () {
    this._texture = Engine.Texture.fromCanvas(this._canvas)
  }

  /**
   * Applies the text options on the given context
   * @param  {Object} textOptions
   * @private
   */
  _applyTextOptions (textOptions) {
    this._context.font = this._text.getFontWeight() + ' ' +
      textOptions.fontSize + 'px ' +
      this._text.getFontFamily()
    this._context.textBaseline = 'top'
    this._context.textAlign = this._text.getAlignment()
    this._context.fillStyle = this._text.getColor().toRGBA()
  }

  /**
   * Iterate over all lines and split them into multiple lines, depending
   * on the width they need
   * @param {Number} maxWidth
   * @return {Array.<string>}
   * @private
   */
  _buildOutputLines (maxWidth) {
    this._textSplitter.setText(this._text.getText())
    this._textSplitter.setMaxWidth(maxWidth)
    return this._textSplitter.getLines()
  }

  /**
   * Draws the given line onto context at the given Y position
   * @param  {String} text
   * @param  {Number} y
   * @private
   */
  _renderTextLine (text, y) {
    const textAlignment = this._text.getAlignment()
    if (textAlignment === 'center') {
      this._context.fillText(text, this._canvas.width / 2, y)
    } else if (textAlignment === 'left') {
      this._context.fillText(text, 0, y)
    } else if (textAlignment === 'right') {
      this._context.fillText(text, this._canvas.width, y)
    }
  }

  /**
   * Renders this sprite
   * @param  {PhotoEditorSDK} sdk
   * @returns {Promise}
   */
  update (sdk) {
    const textOptions = this.calculateFontStyles(sdk)
    const { boundingBox, lines } = this._calculateText(sdk, textOptions)
    return this._renderText(sdk, boundingBox, lines, textOptions)
  }

  /**
   * Renders the text
   * @param  {PhotoEditorSDK} sdk
   * @param  {Vector2} boundingBox
   * @param  {Array.<String>} lines
   * @param  {Object} textOptions
   * @return {Promise}
   * @private
   */
  _renderText (sdk, boundingBox, lines, textOptions) {
    return new Promise((resolve, reject) => {
      // Resize the canvas
      this._canvas.width = boundingBox.x
      this._canvas.height = boundingBox.y

      if (this._text.getMaxHeight()) {
        this._canvas.height = Math.min(
          this._text.getMaxHeight(),
          this._canvas.height
        )
      }

      // Update the context
      this._context = this._canvas.getContext('2d')

      // Render background color
      this._context.fillStyle = this._text.getBackgroundColor().toRGBA()
      this._context.fillRect(0, 0, boundingBox.x, boundingBox.y)

      // Apply text options
      this._applyTextOptions(textOptions)

      // Draw lines
      for (var lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum]
        this._renderTextLine(line, textOptions.lineHeight * lineNum)
      }

      resolve()
    })
  }

  /**
   * Calculates the actual font size and line height
   * @param  {PhotoEditorSDK} sdk
   * @param  {Boolean} considerZoom
   */
  calculateFontStyles (sdk, considerZoom = false) {
    let fontSize = this._text.getFontSize()
    let lineHeight = this._text.getLineHeight() * fontSize

    if (considerZoom) {
      const zoom = sdk.getZoom()
      fontSize *= zoom
      lineHeight *= zoom
    }

    return { fontSize, lineHeight }
  }

  /**
   * Calculates the bounding box and new lines according to max width
   * @param  {PhotoEditorSDK} sdk
   * @param  {Object} textOptions
   * @return {Object}
   * @private
   */
  _calculateText (sdk, textOptions) {
    // Calculate max width
    let maxWidth = this._text.getMaxWidth()

    // Apply text options
    this._applyTextOptions(textOptions)

    // Calculate bounding box
    let boundingBox = new Vector2()
    let lines = this._text.getText().split('\n')
    if (typeof maxWidth !== 'undefined') {
      // Calculate the bounding box
      boundingBox.x = maxWidth
      lines = this._buildOutputLines(maxWidth)
    } else {
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum]
        boundingBox.x = Math.max(boundingBox.x, this._context.measureText(line).width)
      }
    }

    // Calculate boundingbox height
    boundingBox.y = textOptions.lineHeight * lines.length

    return { boundingBox, lines }
  }

  /**
   * Returns this renderer's texture
   * @return {Engine.Texture}
   */
  getTexture () {
    return this._texture
  }

  /**
   * Returns the bounding box for this text
   * @param  {PhotoEditorSDK} sdk
   * @param  {Boolean} considerZoom = false
   * @return {Vector2}
   */
  getBoundingBox (sdk, considerZoom = false) {
    const textOptions = this.calculateFontStyles(sdk)
    const { boundingBox } = this._calculateText(sdk, textOptions)
    if (considerZoom) {
      boundingBox.multiply(sdk.getZoom())
    }
    return boundingBox
  }
}
