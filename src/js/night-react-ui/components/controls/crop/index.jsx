/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import CropControlsComponent from './crop-controls-component'
import CropCanvasControlsComponent from './crop-canvas-controls-component'

export default {
  canvasControls: CropCanvasControlsComponent,
  controls: CropControlsComponent,
  identifier: 'crop',
  icon: 'controls/overview/crop@2x.png',
  label: 'controls.overview.crop',
  getInitialSharedState: (editor) => {
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
  },
  isSelectable: (editor) => {
    return editor.isFeatureEnabled('crop')
  }
}
