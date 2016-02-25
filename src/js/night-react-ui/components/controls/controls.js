/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * The base class for all controls
 * @class
 * @memberof PhotoEditorSDK.UI.NightReact
 */
class Control {
  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @override
   */
  getInitialSharedState () {
    return {}
  }

  /**
   * Checks if this control is available to the user
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @return {Boolean}
   * @override
   */
  isAvailable (editor) {
    return false
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 */
Control.controlsComponent = null

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 */
Control.canvasControlsComponent = null

/**
 * This control's identifier
 * @type {String}
 * @default
 */
Control.identifier = null

/**
 * This control's icon path
 * @type {String}
 */
Control.iconPath = null

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 */
Control.languageKey = null

/**
 * The default options for this control
 * @type {Object}
 */
Control.defaultOptions = {}

export default Control
