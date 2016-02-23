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
 * Breeze Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class BreezeFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Desaturation
    this._stack.push(new FilterPrimitives.Desaturation({
      desaturation: 0.5
    }))

    // Tone curve
    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [170, 170],
          [212, 219],
          [234, 242],
          [255, 255]
        ],
        green: [
          [0, 0],
          [170, 168],
          [234, 231],
          [255, 255]
        ],
        blue: [
          [0, 0],
          [170, 170],
          [212, 208],
          [255, 255]
        ]
      }
    }))
  }
}

BreezeFilter.identifier = 'breeze'
BreezeFilter.displayName = 'Breeze'

export default BreezeFilter
