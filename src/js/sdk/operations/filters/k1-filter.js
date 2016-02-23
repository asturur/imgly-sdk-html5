/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Filter from './filter'
import FilterPrimitives from './primitives'

/**
 * K1 Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class K1Filter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.push(new FilterPrimitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [53, 32],
        [91, 80],
        [176, 205],
        [255, 255]
      ]
    }))

    // Saturation
    this._stack.push(new FilterPrimitives.Saturation({
      saturation: 0.9
    }))
  }
}

K1Filter.identifier = 'k1'
K1Filter.displayName = 'K1'

export default K1Filter
