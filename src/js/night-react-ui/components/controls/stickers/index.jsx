/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { SDKUtils, Constants } from '../../../globals'
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
    const { editor } = this.props
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
  clickAtPosition: (position, context) => {
    if (!context.ui.operationExists('sticker')) return false
    const renderer = context.kit.getRenderer()
    const operation = context.ui.getOrCreateOperation('sticker')
    const sticker = operation.getStickerAtPosition(renderer, position)
    if (!sticker) {
      return false
    } else {
      return { selectedSticker: sticker }
    }
  },

  /**
   * Returns the initial state for this control
   * @param  {Object} context
   * @param  {Object} additionalState = {}
   * @return {Object}
   */
  getInitialSharedState: (context, additionalState = {}) => {
    const operationExistedBefore = context.ui.operationExists('sticker')
    const operation = context.ui.getOrCreateOperation('sticker')
    const stickers = operation.getStickers()
    const initialOptions = operation.serializeOptions()

    const state = {
      operationExistedBefore, operation, stickers, initialOptions
    }

    return SDKUtils.extend({}, state, additionalState)
  },

  isSelectable: (ui) => {
    return ui.isOperationEnabled('sticker')
  }
}
