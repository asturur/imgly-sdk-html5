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
import * as FilterPrimitives from './primitives'

/**
 * KDynamic Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class KDynamicFilter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.push(new FilterPrimitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [17, 27],
        [46, 69],
        [90, 112],
        [156, 200],
        [203, 243],
        [255, 255]
      ]
    }))

    // Saturation
    this._stack.push(new FilterPrimitives.Saturation({
      saturation: 0.7
    }))
  }
}

/**
 * This filter's identifier
 * @type {String}
 * @default
 */
KDynamicFilter.identifier = 'kdynamic'

KDynamicFilter.displayName = 'KDynamic'

export default KDynamicFilter
