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
 * BW Filter
 * @class
 * @alias PhotoEditorSDK.Filters.BWFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class BWFilter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new Filter.Primitives.Grayscale())
  }
}

BWFilter.identifier = 'bw'
BWFilter.name = 'B&W'

export default BWFilter
