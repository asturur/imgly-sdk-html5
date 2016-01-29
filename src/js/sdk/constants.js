/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * The available render types
 * @enum {string}
 * @alias PhotoEditorSDK.RenderType
 */
export default {
  RenderType: {
    IMAGE: 'image',
    DATAURL: 'data-url',
    BUFFER: 'buffer',
    BLOB: 'blob',
    MSBLOB: 'ms-blob'
  },
  ImageFormat: {
    PNG: 'image/png',
    JPEG: 'image/jpeg'
  },
  Events: {
    OPERATION_UPDATED: 'operation:update'
  }
}
