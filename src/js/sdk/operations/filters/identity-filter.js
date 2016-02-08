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
 * Identity Filter
 * @class
 * @alias PhotoEditorSDK.Filters.IdentityFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class IdentityFilter extends Filter {
  /**
   * Renders the filter
   * @return {Promise}
   */
  render () {
    return Promise.resolve()
  }
}

IdentityFilter.isIdentity = true
IdentityFilter.displayName = 'Original'
IdentityFilter.identifier = 'identity'

export default IdentityFilter
