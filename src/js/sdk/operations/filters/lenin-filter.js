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
 * Lenin Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class LeninFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Desaturation
    this._stack.push(new FilterPrimitives.Desaturation({
      desaturation: 0.4
    }))

    // Tone curve
    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 20],
          [40, 20],
          [106, 111],
          [129, 153],
          [190, 223],
          [255, 255]
        ],
        green: [
          [0, 20],
          [40, 20],
          [62, 41],
          [106, 108],
          [132, 159],
          [203, 237],
          [255, 255]
        ],
        blue: [
          [0, 40],
          [40, 40],
          [73, 60],
          [133, 160],
          [191, 297],
          [203, 237],
          [237, 239],
          [255, 255]
        ]
      }
    }))
  }
}

LeninFilter.identifier = 'lenin'
LeninFilter.displayName = 'Lenin'

export default LeninFilter
