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
 * Gobblin Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class GobblinFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new FilterPrimitives.Gobblin())
  }
}

/**
 * This filter's identifier
 * @type {String}
 * @default
 */
GobblinFilter.identifier = 'gobblin'

GobblinFilter.displayName = 'Gobblin'

export default GobblinFilter
