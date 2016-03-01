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
import FiltersControlsComponent from './filter-controls-component'

/**
 * The filters controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class FiltersControls extends Controls {
  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @override
   */
  static getInitialSharedState (editor) {
    const operationExistedBefore = editor.operationExists('filter')
    const operation = editor.getOrCreateOperation('filter')
    const initialOptions = {
      filter: operation.getFilter(),
      intensity: operation.getIntensity()
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
   * @override
   */
  static isAvailable (editor) {
    return editor.isToolEnabled(this.identifier)
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
FiltersControls.controlsComponent = FiltersControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
FiltersControls.identifier = 'filter'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
FiltersControls.iconPath = 'controls/overview/filters@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
FiltersControls.languageKey = 'controls.overview.filters'

/**
 * The default options for this control
 * @type {Object}
 * @property {PhotoEditorSDK.Filter[]} [additionalFilters = []]
 * @property {Boolean} [replaceFilters = false]
 * @property {String[]} [availableFilters = null]
 */
FiltersControls.defaultOptions = {
  additionalFilters: [],
  replaceFilters: false,
  availableFilters: null
}

export default FiltersControls
