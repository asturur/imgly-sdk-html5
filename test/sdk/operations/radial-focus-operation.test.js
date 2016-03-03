/* global SpecHelpers, PhotoEditorSDK, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

describe('RadialFocusOperation', function () {
  let sdk
  beforeEach(function () {
    sdk = SpecHelpers.initSDK()
  })

  // This operation takes some time on canvas...
  this.timeout(10000)

  describe('#render', function () {
    it('should succeed', function () {
      sdk.createOperation('radial-focus', {
        position: new PhotoEditorSDK.Math.Vector2(0.5, 0.5)
      })

      return sdk.render()
        .should.be.fulfilled
    })
  })
})
