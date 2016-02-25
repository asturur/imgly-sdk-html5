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
import OrientationControlsComponent from './orientation-controls-component'

/**
 * The orientation controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class OrientationControls extends Controls {
  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @ignore
   */
  static getInitialSharedState (editor) {
    const operationExistedBefore = editor.operationExists('orientation')
    const operation = editor.getOrCreateOperation('orientation')
    const initialOptions = operation.serializeOptions()

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
    return editor.isToolEnabled('rotation') ||
      editor.isToolEnabled('flip')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
OrientationControls.controlsComponent = OrientationControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
OrientationControls.identifier = 'orientation'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
OrientationControls.iconPath = 'controls/overview/orientation@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
OrientationControls.languageKey = 'controls.overview.orientation'

/**
 * The default options for this control
 * @type {Object}
 */
OrientationControls.defaultOptions = {

}

export default OrientationControls
