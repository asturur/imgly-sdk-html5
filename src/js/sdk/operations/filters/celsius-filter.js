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
 * Celsius Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class CelsiusFilter extends Filter {
  constructor (...args) {
    super(...args)
    this._stack.push(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 69],
          [55, 110],
          [202, 230],
          [255, 255]
        ],
        green: [
          [0, 44],
          [89, 93],
          [185, 141],
          [255, 189]
        ],
        blue: [
          [0, 76],
          [39, 82],
          [218, 138],
          [255, 171]
        ]
      }
    }))
  }
}

CelsiusFilter.identifier = 'celsius'
CelsiusFilter.displayName = 'Celsius'

export default CelsiusFilter
