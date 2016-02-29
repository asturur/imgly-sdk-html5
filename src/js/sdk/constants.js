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
  /**
   * The available render types
   * @enum {String}
   * @alias RenderType
   * @memberof PhotoEditorSDK
   */
  RenderType: {
    IMAGE: 'image',
    DATAURL: 'data-url',
    BUFFER: 'buffer',
    BLOB: 'blob',
    MSBLOB: 'ms-blob'
  },

  /**
   * The available image types
   * @enum {String}
   * @alias ImageFormat
   * @memberof PhotoEditorSDK
   */
  ImageFormat: {
    PNG: 'image/png',
    JPEG: 'image/jpeg'
  },
  Events: {
    OPERATION_UPDATED: 'operation:update'
  }
}
