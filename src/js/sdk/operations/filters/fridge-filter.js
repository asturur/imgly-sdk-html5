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

/**
 * Fridge Filter
 * @class
 * @alias PhotoEditorSDK.Filters.FridgeFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class FridgeFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.push(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 9],
          [21, 11],
          [45, 24],
          [255, 220]
        ],
        green: [
          [0, 12],
          [21, 21],
          [42, 42],
          [150, 150],
          [170, 173],
          [255, 210]
        ],
        blue: [
          [0, 28],
          [43, 72],
          [128, 185],
          [255, 220]
        ]
      }
    }))
  }
}

FridgeFilter.identifier = 'fridge'
FridgeFilter.displayName = 'Fridge'

export default FridgeFilter
