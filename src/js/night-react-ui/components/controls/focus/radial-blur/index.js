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
import RadialBlurControlsComponent from './radial-blur-controls-component'
import RadialBlurCanvasControlsComponent from './radial-blur-canvas-controls-component'

/**
 * The radial blur controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class RadialBlurControls extends Controls {
  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @ignore
   */
  static getInitialSharedState (editor) {
    const operationExistedBefore = editor.operationExists('radial-blur')
    const operation = editor.getOrCreateOperation('radial-blur')
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
    return editor.isToolEnabled('radial-blur')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
RadialBlurControls.controlsComponent = RadialBlurControlsComponent

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 */
RadialBlurControls.canvasControlsComponent = RadialBlurCanvasControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
RadialBlurControls.identifier = 'radial-blur'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
RadialBlurControls.iconPath = 'controls/focus/radial-blur@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
RadialBlurControls.languageKey = 'controls.focus.radial-blur'

/**
 * The default options for this control
 * @type {Object}
 */
RadialBlurControls.defaultOptions = {

}

export default RadialBlurControls
