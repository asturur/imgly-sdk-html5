/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2, SDKUtils, Constants } from '../../../globals'
import TextCanvasControlsComponent from './text-canvas-controls-component'
import TextControlsComponent from './text-controls-component'

export default {
  canvasControls: TextCanvasControlsComponent,
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
      const { editor } = this.props
      editor.addHistory(
        operation,
        initialOptions,
        this.getSharedState('operationExistedBefore')
      )
    }

    this._emitEvent(Constants.EVENTS.CANVAS_UNDO_ZOOM)
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])
  },

  /**
   * Checks if there is something at the given position that
   * would cause the UI to switch to this control on click
   * @param  {Vector2} position
   * @param  {Editor} editor
   * @return {*}
   */
  clickAtPosition: (position, editor) => {
    if (!editor.operationExists('text')) return false
    const sdk = editor.getSDK()
    const operation = editor.getOrCreateOperation('text')
    const text = operation.getTextAtPosition(sdk, position)
    if (!text) {
      return false
    } else {
      return { selectedText: text }
    }
  },

  /**
   * Returns the initial state for this control
   * @param  {Object} context
   * @param  {Object} additionalState = {}
   * @return {Object}
   */
  getInitialSharedState: (context, additionalState = {}) => {
    let state = {}
    state.operationExistedBefore = context.ui.operationExists('text')
    state.operation = context.ui.getOrCreateOperation('text')
    state.texts = state.operation.getTexts()
    state.initialOptions = state.operation.serializeOptions()
    state.operation.setTexts([])

    if (!additionalState.selectedText) {
      const renderer = context.kit.getRenderer()
      const text = state.operation.createText({
        text: 'Text',
        maxWidth: 0.5,
        maxHeight: renderer.getMaxDimensions(),
        anchor: new Vector2(0.5, 0),
        pivot: new Vector2(0.5, 0)
      })
      state.texts.push(text)
      state.selectedText = text
    }

    context.kit.render()

    return SDKUtils.extend({}, state, additionalState)
  },
  isSelectable: (ui) => {
    return ui.isOperationEnabled('text')
  }
}
