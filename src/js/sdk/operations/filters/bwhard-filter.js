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
 * BWHard Filter
 * @class
 * @alias PhotoEditorSDK.Filters.BWHardFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class BWHardFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new Filter.Primitives.Grayscale())
    this._stack.push(new Filter.Primitives.Contrast({
      contrast: 1.5
    }))
  }
}

BWHardFilter.identifier = 'bwhard'
BWHardFilter.name = '1920'

export default BWHardFilter
