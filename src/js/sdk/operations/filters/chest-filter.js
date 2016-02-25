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
import FilterPrimitives from './primitives'

/**
 * Chest Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class ChestFilter extends Filter {
  constructor (...args) {
    super(...args)
    // Tone curve
    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [44, 44],
          [124, 143],
          [221, 204],
          [255, 255]
        ],
        green: [
          [0, 0],
          [130, 127],
          [213, 199],
          [255, 255]
        ],
        blue: [
          [0, 0],
          [51, 52],
          [219, 204],
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
ChestFilter.identifier = 'chest'

ChestFilter.displayName = 'Chest'

export default ChestFilter
