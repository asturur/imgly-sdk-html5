/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2 } from '../../../../globals'
import Controls from '../../controls'
import TiltShiftControlsComponent from './tilt-shift-controls-component'
import TiltShiftCanvasControlsComponent from './tilt-shift-canvas-controls-component'

/**
 * The radial blur controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class TiltShiftControls extends Controls {
  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @ignore
   */
  static getInitialSharedState (editor) {
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
  }

  /**
   * Checks if this control is available to the user
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @return {Boolean}
   * @ignore
   */
  static isAvailable (editor) {
    return editor.isToolEnabled('tilt-shift')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
TiltShiftControls.controlsComponent = TiltShiftControlsComponent

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 */
TiltShiftControls.canvasControlsComponent = TiltShiftCanvasControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
TiltShiftControls.identifier = 'tilt-shift'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
TiltShiftControls.iconPath = 'controls/focus/tilt-shift@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
TiltShiftControls.languageKey = 'controls.focus.tilt-shift'

/**
 * The default options for this control
 * @type {Object}
 */
TiltShiftControls.defaultOptions = {

}

export default TiltShiftControls
