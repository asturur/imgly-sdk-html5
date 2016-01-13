/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import ContrastControlsComponent from './contrast-controls-component'

export default {
  canvasControls: null,
  controls: ContrastControlsComponent,
  identifier: 'contrast',
  icon: 'controls/adjustments/contrast@2x.png',
  label: 'controls.adjustments.contrast',
  getInitialSharedState: (editor) => {
    const operationExistedBefore = editor.operationExists('contrast')
    const operation = editor.getOrCreateOperation('contrast')
    const initialOptions = {
      contrast: operation.getContrast()
    }
    return {
      operationExistedBefore,
      operation,
      initialOptions
    }
  },
  isSelectable: (editor) => {
    return editor.isOperationEnabled('contrast')
  }
}
