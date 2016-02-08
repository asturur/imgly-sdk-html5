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
 * K6 Filter
 * @class
 * @alias PhotoEditorSDK.Filters.K6Filter
 * @extends {PhotoEditorSDK.Filter}
 */
class K6Filter extends Filter {
  constructor (...args) {
    super(...args)

    // Saturation
    this._stack.push(new Filter.Primitives.Saturation({
      saturation: 0.5
    }))
  }
}

K6Filter.identifier = 'k6'
K6Filter.name = 'K6'

export default K6Filter
