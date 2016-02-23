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
 * Orchid Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class OrchidFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 0],
          [115, 130],
          [195, 215],
          [255, 255]
        ],
        green: [
          [0, 0],
          [148, 153],
          [172, 215],
          [255, 255]
        ],
        blue: [
          [0, 46],
          [58, 75],
          [178, 205],
          [255, 255]
        ]
      }
    }))

    // Tone curve
    this._stack.push(new FilterPrimitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [117, 151],
        [189, 217],
        [255, 255]
      ]
    }))

    // Desaturation
    this._stack.push(new FilterPrimitives.Desaturation({
      desaturation: 0.65
    }))
  }
}

OrchidFilter.identifier = 'orchid'
OrchidFilter.displayName = 'Orchid'

export default OrchidFilter
