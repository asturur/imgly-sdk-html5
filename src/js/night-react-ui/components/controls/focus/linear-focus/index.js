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
import LinearFocusControlsComponent from './linear-focus-controls-component'
import LinearFocusCanvasControlsComponent from './linear-focus-canvas-controls-component'

/**
 * The radial blur controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class LinearFocusControls extends Controls {
  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @ignore
   */
  static getInitialSharedState (editor) {
    const operationExistedBefore = editor.operationExists('linear-focus')
    const operation = editor.getOrCreateOperation('linear-focus', {
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
    return editor.isToolEnabled('linear-focus')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
LinearFocusControls.controlsComponent = LinearFocusControlsComponent

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
LinearFocusControls.canvasControlsComponent = LinearFocusCanvasControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
LinearFocusControls.identifier = 'linear-focus'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
LinearFocusControls.iconPath = 'controls/focus/linear@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
LinearFocusControls.languageKey = 'controls.focus.linear'

/**
 * The default options for this control
 * @type {Object}
 */
LinearFocusControls.defaultOptions = {

}

export default LinearFocusControls
