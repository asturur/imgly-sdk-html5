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
import AdjustmentsControlsComponent from './adjustments-controls-component'

/**
 * The adjustments controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class AdjustmentsControls extends Controls {
  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @override
   * @ignore
   */
  static getInitialSharedState (editor) {
    const operationExistedBefore = editor.operationExists('adjustments')
    const operation = editor.getOrCreateOperation('adjustments')
    const initialOptions = operation.serializeOptions()
    return {
      operation, operationExistedBefore, initialOptions
    }
  }

  /**
   * Checks if this control is available to the user
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @return {Boolean}
   * @override
   * @ignore
   */
  static isAvailable (editor) {
    return editor.isToolEnabled('brightness') ||
      editor.isToolEnabled('saturation') ||
      editor.isToolEnabled('contrast')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
AdjustmentsControls.controlsComponent = AdjustmentsControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
AdjustmentsControls.identifier = 'adjustments'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
AdjustmentsControls.iconPath = 'controls/overview/adjustments@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
AdjustmentsControls.languageKey = 'controls.overview.adjustments'

/**
 * The default options for this control
 * @type {Object}
 */
AdjustmentsControls.defaultOptions = {

}

export default AdjustmentsControls
