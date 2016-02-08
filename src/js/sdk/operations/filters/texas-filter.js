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
 * Texas Filter
 * @class
 * @alias PhotoEditorSDK.Filters.TexasFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class TexasFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new Filter.Primitives.ToneCurve({
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

TexasFilter.identifier = 'texas'
TexasFilter.name = 'Texas'

export default TexasFilter
