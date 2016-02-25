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
 * Fixie Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class FixieFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [44, 28],
          [63, 48],
          [128, 132],
          [235, 248],
          [255, 255]
        ],
        green: [
          [0, 0],
          [20, 10],
          [60, 45],
          [190, 209],
          [211, 231],
          [255, 255]
        ],
        blue: [
          [0, 31],
          [41, 62],
          [150, 142],
          [234, 212],
          [255, 224]
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
FixieFilter.identifier = 'fixie'

FixieFilter.displayName = 'Fixie'

export default FixieFilter
