/* global SpecHelpers, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

describe('AdjustmentsOperation', function () {
  let sdk
  beforeEach(function () {
    sdk = SpecHelpers.initSDK()
  })

  describe('#render', function () {
    it('should succeed', function () {
      sdk.createOperation('adjustments')

      return sdk.render()
        .should.be.fulfilled
    })
  })
})
