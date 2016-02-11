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
import SpriteCanvasControlsComponent from '../sprites/sprites-canvas-controls-component'

export default {
  canvasControls: SpriteCanvasControlsComponent,
  controls: StickersControlsComponent,
  identifier: 'sticker',
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

    this._emitEvent(Constants.EVENTS.ZOOM_UNDO)
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])
    this._emitEvent(Constants.EVENTS.RENDER)
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
    if (sprite && sprite instanceof Sticker) {
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
    const stickers = operation.getSpritesOfType(Sticker)
    const initialOptions = operation.serializeOptions()

    operation.setEnabled(false)

    const state = {
      operationExistedBefore, operation, sprites, stickers, initialOptions
    }

    return SDKUtils.extend({}, state, additionalState)
  },

  /**
   * Checks if this control is available to the user
   * @param  {Editor} editor
   * @return {Boolean}
   */
  isAvailable: (editor) => {
    return editor.isToolEnabled('sticker')
  }
}
