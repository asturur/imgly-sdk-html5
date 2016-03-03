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
 * Semired Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class SemiredFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 129],
          [75, 153],
          [181, 227],
          [255, 255]
        ],
        green: [
          [0, 8],
          [111, 85],
          [212, 158],
          [255, 226]
        ],
        blue: [
          [0, 5],
          [75, 22],
          [193, 90],
          [255, 229]
        ]
      }
    }))

    this._stack.push(new FilterPrimitives.Glow())
  }
}

/**
 * This filter's identifier
 * @type {String}
 * @default
 */
SemiredFilter.identifier = 'semired'

SemiredFilter.displayName = 'Semired'

export default SemiredFilter
