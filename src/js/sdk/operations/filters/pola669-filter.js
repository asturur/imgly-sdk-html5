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
 * Pola669 Filter
 * @class
 * @alias PhotoEditorSDK.Filters.Pola669Filter
 * @extends {PhotoEditorSDK.Filter}
 */
class Pola669Filter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new Filter.Primitives.ToneCurve({
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

    this._stack.push(new Filter.Primitives.Saturation({
      saturation: 0.8
    }))

    this._stack.push(new Filter.Primitives.Contrast({
      contrast: 1.5
    }))
  }
}

Pola669Filter.identifier = 'pola669'
Pola669Filter.name = 'Pola 669'

export default Pola669Filter
