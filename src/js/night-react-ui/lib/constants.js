/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default {
  EVENTS: {
    RENDER: 'render',
    EXPORT: 'export',
    ZOOM: 'zoom',
    ZOOM_DONE: 'zoom:done',
    ZOOM_UNDO: 'zoom:undo',
    OPERATION_CREATED: 'operation:created',
    OPERATION_UPDATED: 'operation:updated',
    OPERATION_REMOVED: 'operation:removed',
    FEATURES_DISABLED: 'editor:features:disabled',
    FEATURES_ENABLED: 'editor:features:enabled',
    FEATURES_UPDATED: 'editor:features:updated',
    COLORPICKER_OPEN: 'colorpicker:open',
    HISTORY_UPDATED: 'history:update',
    HISTORY_UNDO: 'history:undo',
    WINDOW_RESIZE: 'window:resize',
    CONTROLS_SWITCHED: 'controls:switched'
  }
}
