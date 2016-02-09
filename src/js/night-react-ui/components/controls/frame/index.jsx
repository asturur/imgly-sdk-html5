/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Constants } from '../../../globals'
import FrameControlsComponent from './frame-controls-component'

export default {
  canvasControls: null,
  controls: FrameControlsComponent,
  identifier: 'frame',
  icon: 'controls/overview/frame@2x.png',
  label: 'controls.overview.frame',

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

    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM_UNDO)
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  },

  /**
   * Returns the initial shared state for this control
   * @param  {Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   */
  getInitialSharedState: (editor) => {
    const inputDimensions = editor.getInputDimensions()
    const defaultThickness = Math.min(inputDimensions.x, inputDimensions.y) * 0.05

    const operationExistedBefore = editor.operationExists('frame')
    const operation = editor.getOrCreateOperation('frame', {
      thickness: defaultThickness
    })
    const initialOptions = {
      color: operation.getColor().clone(),
      thickness: operation.getThickness()
    }
    return {
      operation, operationExistedBefore, initialOptions
    }
  },

  /**
   * Checks if this control is available to the user
   * @param  {Editor} editor
   * @return {Boolean}
   */
  isAvailable: (editor) => {
    return editor.isFeatureEnabled('frame')
  }
}
