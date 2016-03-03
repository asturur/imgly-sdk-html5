/* global PhotoEditorSDK, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const { Utils } = PhotoEditorSDK

describe('Utils', function () {
  describe('#isArray', function () {
    it('should return true for arrays', function () {
      Utils.isArray([]).should.equal(true)
    })

    it('should return false for everything else', function () {
      Utils.isArray({}).should.equal(false)
    })
  })
})
