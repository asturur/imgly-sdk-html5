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
 * Texas Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class TexasFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 72],
          [89, 99],
          [176, 212],
          [255, 237]
        ],
        green: [
          [0, 49],
          [255, 192]
        ],
        blue: [
          [0, 72],
          [255, 151]
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
TexasFilter.identifier = 'texas'

TexasFilter.displayName = 'Texas'

export default TexasFilter
