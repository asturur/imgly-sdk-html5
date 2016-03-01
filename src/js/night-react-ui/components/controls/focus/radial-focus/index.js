/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Controls from '../../controls'
import RadialFocusControlsComponent from './radial-focus-controls-component'
import RadialFocusCanvasControlsComponent from './radial-focus-canvas-controls-component'

/**
 * The radial focus controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class RadialFocusControls extends Controls {
  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @ignore
   */
  static getInitialSharedState (editor) {
    const operationExistedBefore = editor.operationExists('radial-focus')
    const operation = editor.getOrCreateOperation('radial-focus')
    const initialOptions = {
      position: operation.getPosition().clone(),
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
    return editor.isToolEnabled('radial-focus')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
RadialFocusControls.controlsComponent = RadialFocusControlsComponent

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
RadialFocusControls.canvasControlsComponent = RadialFocusCanvasControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
RadialFocusControls.identifier = 'radial-focus'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
RadialFocusControls.iconPath = 'controls/focus/radial@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
RadialFocusControls.languageKey = 'controls.focus.radial'

/**
 * The default options for this control
 * @type {Object}
 */
RadialFocusControls.defaultOptions = {

}

export default RadialFocusControls
