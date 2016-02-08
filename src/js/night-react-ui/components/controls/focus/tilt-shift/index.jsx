/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2 } from '../../../../globals'
import TiltShiftControlsComponent from './tilt-shift-controls-component'
import TiltShiftCanvasControlsComponent from './tilt-shift-canvas-controls-component'

export default {
  canvasControls: TiltShiftCanvasControlsComponent,
  controls: TiltShiftControlsComponent,
  identifier: 'tilt-shift',
  icon: 'controls/focus/tilt-shift@2x.png',
  label: 'controls.focus.tilt-shift',

  /**
   * Returns the initial shared state for this control
   * @param  {Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   */
  getInitialSharedState: (editor) => {
    const operationExistedBefore = editor.operationExists('tilt-shift')
    const operation = editor.getOrCreateOperation('tilt-shift', {
      start: new Vector2(0.49, 0.5),
      end: new Vector2(0.51, 0.5)
    })
    const initialOptions = {
      start: operation.getStart().clone(),
      end: operation.getEnd().clone(),
      gradientRadius: operation.getGradientRadius(),
      blurRadius: operation.getBlurRadius()
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
    return editor.isFeatureEnabled('tilt-shift')
  }
}
