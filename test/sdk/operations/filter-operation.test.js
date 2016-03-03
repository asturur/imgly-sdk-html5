/* global PhotoEditorSDK, SpecHelpers, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

describe('FilterOperation', function () {
  let sdk

  beforeEach(function () {
    sdk = SpecHelpers.initSDK()
  })

  describe('with no selected filter', function () {
    it('rendering should pass (default filter is identity)', function () {
      return sdk.render()
        .should.be.fulfilled
    })
  })

  describe('#render', function () {
    for (var name in PhotoEditorSDK.Filters) {
      (function (name) {
        it(`should work with ${name} filter`, function () {
          this.timeout(10000)
          sdk.getOperationsStack().clear()
          sdk.createOperation('filter', {
            filter: PhotoEditorSDK.Filters[name]
          })

          return sdk.render()
            .should.be.fulfilled
        })
      })(name)
    }
  })

  describe('#setFilter', function () {
    it('should correctly update the filter', function () {
      const filterOperation = sdk.createOperation('filter', {
        filter: PhotoEditorSDK.Filters.IdentityFilter
      })
      const filterInstance = filterOperation._selectedFilter
      filterOperation.setFilter(PhotoEditorSDK.Filters.A15Filter)
      filterOperation._selectedFilter.should.not.equal(filterInstance)
    })
  })
})
