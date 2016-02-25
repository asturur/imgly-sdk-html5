/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Promise } from '../../globals'
import Filter from './filter'

/**
 * Identity Filter
 * @class
 * @extends PhotoEditorSDK.Filter
 * @memberof PhotoEditorSDK.Filters
 */
class IdentityFilter extends Filter {
  /**
   * Renders the filter
   * @param  {PhotoEditorSDK} sdk
   * @param  {Engine.RenderTexture}
   * @return {Promise}
   */
  render (sdk, renderTexture) {
    return Promise.resolve()
  }
}

IdentityFilter.isIdentity = true
IdentityFilter.displayName = 'Original'

/**
 * This filter's identifier
 * @type {String}
 * @default
 */
IdentityFilter.identifier = 'identity'

export default IdentityFilter
