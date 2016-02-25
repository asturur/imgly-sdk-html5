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
 * K6 Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class K6Filter extends Filter {
  constructor (...args) {
    super(...args)

    // Saturation
    this._stack.push(new FilterPrimitives.Saturation({
      saturation: 0.5
    }))
  }
}

/**
 * This filter's identifier
 * @type {String}
 * @default
 */
K6Filter.identifier = 'k6'

K6Filter.displayName = 'K6'

export default K6Filter
