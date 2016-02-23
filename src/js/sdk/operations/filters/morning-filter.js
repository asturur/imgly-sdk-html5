/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Filter from './filter'
import FilterPrimitives from './primitives'

/**
 * Morning Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class MorningFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 40],
          [255, 230]
        ],
        green: [
          [0, 10],
          [255, 225]
        ],
        blue: [
          [0, 20],
          [255, 181]
        ]
      }
    }))

    this._stack.push(new FilterPrimitives.Glow())
  }
}

MorningFilter.identifier = 'morning'
MorningFilter.displayName = 'Morning'

export default MorningFilter
