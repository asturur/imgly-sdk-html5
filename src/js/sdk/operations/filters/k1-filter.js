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
 * K1 Filter
 * @class
 * @alias PhotoEditorSDK.Filters.K1Filter
 * @extends {PhotoEditorSDK.Filter}
 */
class K1Filter extends Filter {
  constructor (...args) {
    super(...args)

    // Tone curve
    this._stack.push(new Filter.Primitives.ToneCurve({
      controlPoints: [
        [0, 0],
        [53, 32],
        [91, 80],
        [176, 205],
        [255, 255]
      ]
    }))

    // Saturation
    this._stack.push(new Filter.Primitives.Saturation({
      saturation: 0.9
    }))
  }
}

K1Filter.identifier = 'k1'
K1Filter.name = 'K1'

export default K1Filter
