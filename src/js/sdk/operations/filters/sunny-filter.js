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
 * Sunny Filter
 * @class
 * @alias PhotoEditorSDK.Filters.SunnyFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class SunnyFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [62, 82],
          [141, 154],
          [255, 255]
        ],
        green: [
          [0, 39],
          [56, 96],
          [192, 176],
          [255, 255]
        ],
        blue: [
          [0, 0],
          [174, 99],
          [255, 235]
        ]
      }
    }))

    this._stack.push(new Filter.Primitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [55, 20],
        [158, 191],
        [255, 255]
      ]
    }))
  }
}

SunnyFilter.identifier = 'sunny'
SunnyFilter.name = 'Sunny'

export default SunnyFilter
