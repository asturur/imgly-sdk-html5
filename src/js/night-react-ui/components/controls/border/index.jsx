/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import BorderControlsComponent from './border-controls-component'

export default {
  canvasControls: null,
  controls: BorderControlsComponent,
  identifier: 'border',
  icon: 'controls/overview/border@2x.png',
  label: 'controls.overview.border',

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

    editor.undoZoom()
    editor.enableFeatures('zoom', 'drag')
    editor.render()
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

    const operationExistedBefore = editor.operationExists('border')
    const operation = editor.getOrCreateOperation('border', {
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
    return editor.isToolEnabled('border')
  }
}
