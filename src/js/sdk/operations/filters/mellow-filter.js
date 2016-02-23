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
 * Mellow Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class MellowFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new Filter.Primitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [41, 84],
          [87, 134],
          [255, 255]
        ],
        green: [
          [0, 0],
          [255, 216]
        ],
        blue: [
          [0, 0],
          [255, 131]
        ]
      }
    }))
  }
}

MellowFilter.identifier = 'mellow'
MellowFilter.displayName = 'Mellow'

export default MellowFilter
