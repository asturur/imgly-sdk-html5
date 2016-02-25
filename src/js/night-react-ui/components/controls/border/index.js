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
import BorderControlsComponent from './border-controls-component'

/**
 * The border controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class BorderControls extends Controls {
  /**
   * Gets called when the user leaves these controls
   * @this {StickersControlsComponent}
   * @override
   * @ignore
   */
  static onExit () {
    const { editor } = this.context
    const operation = this.getSharedState('operation')

    editor.addHistory(
      operation,
      this.getSharedState('initialOptions'),
      this.getSharedState('operationExistedBefore')
    )

    operation.setEnabled(true)

    editor.undoZoom()
    editor.enableFeatures('zoom', 'drag')
    editor.render()
  }

  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @override
   * @ignore
   */
  static getInitialSharedState (editor) {
    const inputDimensions = editor.getInputDimensions()
    const defaultThickness = Math.min(inputDimensions.x, inputDimensions.y) * 0.05

    const operationExistedBefore = editor.operationExists('border')
    const operation = editor.getOrCreateOperation('border', {
      thickness: defaultThickness
    })
    const initialOptions = {
      color: operation.getColor().clone(),
      thickness: operation.getThickness()
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
    return editor.isToolEnabled('border')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
BorderControls.controlsComponent = BorderControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
BorderControls.identifier = 'border'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
BorderControls.iconPath = 'controls/overview/border@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
BorderControls.languageKey = 'controls.overview.border'

/**
 * The default options for this control
 * @type {Object}
 */
BorderControls.defaultOptions = {

}

export default BorderControls
