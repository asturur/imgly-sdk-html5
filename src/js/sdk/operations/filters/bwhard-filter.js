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
 * BWHard Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class BWHardFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new FilterPrimitives.Grayscale())
    this._stack.push(new FilterPrimitives.Contrast({
      contrast: 1.5
    }))
  }
}

/**
 * This filter's identifier
 * @type {String}
 * @default
 */
BWHardFilter.identifier = 'bwhard'

BWHardFilter.displayName = '1920'

export default BWHardFilter
