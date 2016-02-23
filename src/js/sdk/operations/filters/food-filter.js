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
 * Food Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class FoodFilter extends Filter {
  constructor (...args) {
    super(...args)
    this._stack.push(new FilterPrimitives.Saturation({
      saturation: 1.35
    }))

    this._stack.push(new FilterPrimitives.Contrast({
      contrast: 1.1
    }))
  }
}

FoodFilter.identifier = 'food'
FoodFilter.displayName = 'Food'

export default FoodFilter
