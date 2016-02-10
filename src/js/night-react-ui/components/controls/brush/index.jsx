/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Constants } from '../../../globals'
import BrushControlsComponent from './brush-controls-component'
import BrushCanvasControlsComponent from './brush-canvas-controls-component'

export default {
  canvasControls: BrushCanvasControlsComponent,
  controls: BrushControlsComponent,
  identifier: 'brush',
  icon: 'controls/overview/brush@2x.png',
  label: 'controls.overview.brush',

  /**
   * Gets called when the user leaves these controls
   * @this {StickersControlsComponent}
   */
  onExit: function () {
    this._emitEvent(Constants.EVENTS.ZOOM_UNDO)
    this._emitEvent(Constants.EVENTS.EDITOR_ENABLE_FEATURES, ['zoom', 'drag'])
  },

  /**
   * Returns the initial shared state for this control
   * @param  {Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   */
  getInitialSharedState: (editor) => {
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
  },

  /**
   * Checks if this control is available to the user
   * @param  {Editor} editor
   * @return {Boolean}
   */
  isAvailable: (editor) => {
    return editor.isFeatureEnabled('brush')
  }
}
