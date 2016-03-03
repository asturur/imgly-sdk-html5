/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Filter from './filter'
import * as FilterPrimitives from './primitives'

/**
 * Glam Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class GlamFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new FilterPrimitives.Contrast({
      contrast: 1.1
    }))

    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [94, 74],
          [181, 205],
          [255, 255]
        ],
        green: [
          [0, 0],
          [127, 127],
          [255, 255]
        ],
        blue: [
          [0, 0],
          [102, 73],
          [227, 213],
          [255, 255]
        ]
      }
    }))
  }
}

/**
 * This filter's identifier
 * @type {String}
 * @default
 */
GlamFilter.identifier = 'glam'

GlamFilter.displayName = 'Glam'

export default GlamFilter
