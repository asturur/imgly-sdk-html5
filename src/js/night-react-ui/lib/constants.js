/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default {
  EVENTS: {
    CANVAS_RENDER: 'canvas:render',
    CANVAS_ZOOM: 'canvas:zoom',
    CANVAS_ZOOM_DONE: 'canvas:zoom:done',
    CANVAS_ZOOM_UNDO: 'canvas:zoom:undo',
    OPERATION_UPDATED: 'operation:update',
    OPERATION_REMOVED: 'operation:removed',
    EDITOR_DISABLE_FEATURES: 'editor:disable',
    EDITOR_ENABLE_FEATURES: 'editor:enable',
    COLORPICKER_OPEN: 'colorpicker:open',
    HISTORY_UPDATED: 'history:update',
    HISTORY_UNDO: 'history:undo',
    WINDOW_RESIZE: 'window:resize'
  }
}
