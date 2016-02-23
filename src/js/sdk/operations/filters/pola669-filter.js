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
 * Pola669 Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class Pola669Filter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [56, 18],
          [196, 209],
          [255, 255]
        ],
        green: [
          [0, 38],
          [71, 84],
          [255, 255]
        ],
        blue: [
          [0, 0],
          [131, 133],
          [204, 211],
          [255, 255]
        ]
      }
    }))

    this._stack.push(new FilterPrimitives.Saturation({
      saturation: 0.8
    }))

    this._stack.push(new FilterPrimitives.Contrast({
      contrast: 1.5
    }))
  }
}

Pola669Filter.identifier = 'pola669'
Pola669Filter.displayName = 'Pola 669'

export default Pola669Filter
