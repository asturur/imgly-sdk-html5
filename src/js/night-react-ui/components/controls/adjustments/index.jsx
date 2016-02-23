/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import AdjustmentsControlsComponent from './adjustments-controls-component'

export default {
  canvasControls: null,
  controls: AdjustmentsControlsComponent,
  identifier: 'adjustments',
  icon: 'controls/overview/adjustments@2x.png',
  label: 'controls.overview.adjustments',

  /**
   * Returns the initial shared state for this control
   * @param  {Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   */
  getInitialSharedState: (editor) => {
    const operationExistedBefore = editor.operationExists('adjustments')
    const operation = editor.getOrCreateOperation('adjustments')
    const initialOptions = operation.serializeOptions()
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
    return editor.isToolEnabled('brightness') ||
      editor.isToolEnabled('saturation') ||
      editor.isToolEnabled('contrast')
  }
}
