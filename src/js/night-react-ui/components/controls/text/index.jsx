/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { SDK, Vector2, SDKUtils, Constants } from '../../../globals'
const { Text } = SDK
import SpritesCanvasControlsComponent from '../sprites/sprites-canvas-controls-component'
import TextControlsComponent from './text-controls-component'

export default {
  canvasControls: SpritesCanvasControlsComponent,
  controls: TextControlsComponent,
  identifier: 'text',
  icon: 'controls/overview/text@2x.png',
  label: 'controls.overview.text',

  /**
   * Gets called when the user leaves these controls
   * @this {StickersControlsComponent}
   */
  onExit: function () {
    const initialOptions = this.getSharedState('initialOptions')
    const operation = this.getSharedState('operation')
    if (!operation.optionsEqual(initialOptions)) {
      const { editor } = this.context
      editor.addHistory(
        operation,
        initialOptions,
        this.getSharedState('operationExistedBefore')
      )
    }

    operation.setEnabled(true)

    const { editor } = this.context
    editor.undoZoom()
    editor.enableFeatures('zoom', 'drag')
    editor.render()
  },

  /**
   * Checks if there is something at the given position that
   * would cause the UI to switch to this control on click
   * @param  {Vector2} position
   * @param  {Editor} editor
   * @return {*}
   */
  clickAtPosition: (position, editor) => {
    if (!editor.operationExists('sprite')) return false

    const sdk = editor.getSDK()
    const operation = editor.getOrCreateOperation('sprite')
    const sprite = operation.getSpriteAtPosition(sdk, position)
    if (sprite && sprite instanceof Text) {
      return { selectedSprite: sprite }
    } else {
      return false
    }
  },

  /**
   * Returns the initial shared state for this control
   * @param  {Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   */
  getInitialSharedState: (editor, additionalState = {}) => {
    const operationExistedBefore = editor.operationExists('sprite')
    const operation = editor.getOrCreateOperation('sprite')
    const sprites = operation.getSprites()
    const initialOptions = operation.serializeOptions()
    let selectedSprite = null

    if (!additionalState.selectedSprite) {
      const sdk = editor.getSDK()
      const renderer = sdk.getRenderer()

      const maxWidth = sdk.getInputDimensions().x / 2
      const text = operation.createText({
        text: 'Double-click to edit',
        maxWidth,
        maxHeight: renderer.getMaxTextureSize(),
        fontSize: 0.15,
        fontFamily: 'Impact',
        alignment: 'center',
        anchor: new Vector2(0, 0),
        pivot: new Vector2(0.5, 0)
      })
      operation.addSprite(text)
      selectedSprite = text
    }

    operation.setEnabled(false)

    editor.render()

    const state = {
      operationExistedBefore, operation, sprites, initialOptions, selectedSprite
    }

    return SDKUtils.extend({}, state, additionalState)
  },

  /**
   * Checks if this control is available to the user
   * @param  {Editor} editor
   * @return {Boolean}
   */
  isAvailable: (editor) => {
    return editor.isToolEnabled('text')
  }
}
