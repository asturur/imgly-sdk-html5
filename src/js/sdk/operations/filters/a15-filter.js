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
 * A15 Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class A15Filter extends Filter {
  constructor (...args) {
    super(...args)
    this._stack.push(new FilterPrimitives.Contrast({
      contrast: 0.63
    }))

    this._stack.push(new FilterPrimitives.Brightness({
      brightness: 0.12
    }))

    this._stack.push(new FilterPrimitives.ToneCurve({
      rgbControlPoints: {
        red: [
          [0, 38],
          [94, 94],
          [148, 142],
          [175, 187],
          [255, 255]
        ],
        green: [
          [0, 0],
          [77, 53],
          [171, 190],
          [255, 255]
        ],
        blue: [
          [0, 10],
          [48, 85],
          [174, 228],
          [255, 255]
        ]
      }
    }))
  }
}

A15Filter.identifier = 'a15'
A15Filter.displayName = '15'

export default A15Filter
