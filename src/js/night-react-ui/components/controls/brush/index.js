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
import BrushControlsComponent from './brush-controls-component'
import BrushCanvasControlsComponent from './brush-canvas-controls-component'

/**
 * The brush controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class BrushControls extends Controls {
  /**
   * Gets called when the user leaves these controls
   * @this {StickersControlsComponent}
   * @override
   * @ignore
   */
  static onExit () {
    const { editor } = this.context
    editor.undoZoom()
    editor.enableFeatures('zoom', 'drag')
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
    const finalDimensions = editor.getSDK().getFinalDimensions()
    const thickness = Math.max(finalDimensions.x, finalDimensions.y) * 0.05

    const operationExistedBefore = editor.operationExists('brush')
    const operation = editor.getOrCreateOperation('brush', {
      thickness
    })
    const initialOptions = {
      paths: operation.getPaths().slice()
    }
    return {
      operation, operationExistedBefore, initialOptions,
      initialThickness: thickness
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
    return editor.isToolEnabled('brush')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
BrushControls.controlsComponent = BrushControlsComponent

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 */
BrushControls.canvasControlsComponent = BrushCanvasControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
BrushControls.identifier = 'brush'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
BrushControls.iconPath = 'controls/overview/brush@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
BrushControls.languageKey = 'controls.overview.brush'

/**
 * The default options for this control
 * @type {Object}
 */
BrushControls.defaultOptions = {

}

export default BrushControls
