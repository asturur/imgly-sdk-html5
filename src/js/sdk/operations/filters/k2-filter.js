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
import Color from '../../lib/color'

/**
 * K2 Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class K2Filter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.push(new FilterPrimitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [54, 33],
        [77, 82],
        [94, 103],
        [122, 126],
        [177, 193],
        [229, 232],
        [255, 255]
      ]
    }))

    // Soft color overlay
    this._stack.push(new FilterPrimitives.SoftColorOverlay({
      color: new Color(40 / 255, 40 / 255, 40 / 255)
    }))
  }
}

/**
 * This filter's identifier
 * @type {String}
 * @default
 */
K2Filter.identifier = 'k2'

K2Filter.displayName = 'K2'

export default K2Filter
