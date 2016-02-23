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
 * X400 Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class X400Filter extends Filter {
  constructor (...args) {
    super(...args)

    this._stack.push(new Filter.Primitives.X400())
  }
}

X400Filter.identifier = 'x400'
X400Filter.displayName = 'X400'

export default X400Filter
