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
  let kit

  beforeEach(function () {
    kit = SpecHelpers.initRenderer()
  })

  describe('with no selected filter', function () {
    it('rendering should pass (default filter is identity)', function () {
      return kit.render()
        .should.be.fulfilled
    })
  })

  describe('#render', function () {
    for (var name in PhotoEditorSDK.Filters) {
      (function (name) {
        it(`should work with ${name} filter`, function () {
          kit.operationsStack.clear()
          const operation = kit.createOperation('filter', {
            filter: PhotoEditorSDK.Filters[name]
          })
          kit.operationsStack.push(operation)

          return kit.render()
            .should.be.fulfilled
        })
      })(name)
    }
  })
})
