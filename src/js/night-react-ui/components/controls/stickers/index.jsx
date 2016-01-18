/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { SDK, SDKUtils, Constants } from '../../../globals'
const { Sticker } = SDK
import StickersControlsComponent from './stickers-controls-component'
import StickersCanvasControlsComponent from './stickers-canvas-controls-component'

export default {
  canvasControls: StickersCanvasControlsComponent,
  controls: StickersControlsComponent,
  identifier: 'stickers',
  icon: 'controls/overview/stickers@2x.png',
  label: 'controls.overview.stickers',

  /**
   * Gets called when the user leaves these controls
   * @this {StickersControlsComponent}
   */
  onExit: function () {
    const { editor } = this.context
    const operation = this.getSharedState('operation')

    editor.addHistory(
      operation,
      this.getSharedState('initialOptions'),
      this.getSharedState('operationExistedBefore')
    )

    operation.setEnabled(true)
    this._emitEvent(Constants.EVENTS.CANVAS_UNDO_ZOOM)
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  },

  /**
   * Checks if there is something at the given position that
   * would cause the UI to switch to this control on click
   * @param  {Vector2} position
   * @param  {Object} context
   * @return {*}
   */
  clickAtPosition: (position, editor) => {
    if (!editor.operationExists('sprite')) return false

    const sdk = editor.getSDK()
    const operation = editor.getOrCreateOperation('sprite')
    const sprite = operation.getSpriteAtPosition(sdk, position)
    if (!sprite) {
      return false
    } else if (sprite instanceof Sticker) {
      return { selectedSticker: sprite }
    }
  },

  /**
   * Returns the initial state for this control
   * @param  {Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   */
  getInitialSharedState: (editor, additionalState = {}) => {
    const operationExistedBefore = editor.operationExists('sprite')
    const operation = editor.getOrCreateOperation('sprite')
    const sprites = operation.getSprites()
    const stickers = operation.getSpritesOfType(Sticker)
    const initialOptions = operation.serializeOptions()

    const state = {
      operationExistedBefore, operation, sprites, stickers, initialOptions
    }

    return SDKUtils.extend({}, state, additionalState)
  },

  isSelectable: (editor) => {
    return editor.isOperationEnabled('sprite')
  }
}
