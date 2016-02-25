/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Controls from '../controls'
import CropControlsComponent from './crop-controls-component'
import CropCanvasControlsComponent from './crop-canvas-controls-component'

/**
 * The crop controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class CropControls extends Controls {
  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @ignore
   */
  static getInitialSharedState (editor) {
    const operationExistedBefore = editor.operationExists('crop')
    const operation = editor.getOrCreateOperation('crop')
    const initialOptions = {
      start: operation.getStart().clone(),
      end: operation.getEnd().clone()
    }
    return {
      operationExistedBefore,
      operation,
      initialOptions
    }
  }

  /**
   * Checks if this control is available to the user
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @return {Boolean}
   * @ignore
   */
  static isAvailable (editor) {
    return editor.isToolEnabled('crop')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
CropControls.controlsComponent = CropControlsComponent

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 */
CropControls.canvasControlsComponent = CropCanvasControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
CropControls.identifier = 'crop'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
CropControls.iconPath = 'controls/overview/crop@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
CropControls.languageKey = 'controls.overview.crop'

/**
 * The default options for this control
 * @type {Object}
 */
CropControls.defaultOptions = {

}

export default CropControls
