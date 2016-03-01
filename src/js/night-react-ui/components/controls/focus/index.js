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
import FocusControlsComponent from './focus-controls-component'

/**
 * The focus controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class FocusControls extends Controls {
  /**
   * Checks if this control is available to the user
   * @param  {Editor} editor
   * @return {Boolean}
   * @ignore
   */
  static isAvailable (editor) {
    return editor.isToolEnabled('radial-focus') ||
      editor.isToolEnabled('linear-focus')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
FocusControls.controlsComponent = FocusControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
FocusControls.identifier = 'focus'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
FocusControls.iconPath = 'controls/overview/focus@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
FocusControls.languageKey = 'controls.overview.focus'

/**
 * The default options for this control
 * @type {Object}
 */
FocusControls.defaultOptions = {

}

export default FocusControls
