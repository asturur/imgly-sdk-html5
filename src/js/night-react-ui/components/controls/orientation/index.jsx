/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import OrientationControlsComponent from './orientation-controls-component'

export default {
  canvasControls: null,
  controls: OrientationControlsComponent,
  identifier: 'orientation',
  icon: 'controls/overview/orientation@2x.png',
  label: 'controls.overview.orientation',

  /**
   * Returns the initial shared state for this control
   * @param  {Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   */
  getInitialSharedState: (editor) => {
    const operationExistedBefore = editor.operationExists('orientation')
    const operation = editor.getOrCreateOperation('orientation')
    const initialOptions = operation.serializeOptions()

    return {
      operationExistedBefore,
      operation,
      initialOptions
    }
  },

  /**
   * Checks if this control is available to the user
   * @param  {Editor} editor
   * @return {Boolean}
   */
  isAvailable: (editor) => {
    return editor.isToolEnabled('rotation') ||
      editor.isToolEnabled('flip')
  }
}
