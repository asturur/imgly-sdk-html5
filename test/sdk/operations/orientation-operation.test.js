/* global SpecHelpers, PhotoEditorSDK, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

describe('OrientationOperation', function () {
  let sdk, image

  beforeEach(function () {
    sdk = SpecHelpers.initSDK()
    image = sdk.getImage()
  })

  describe('with a rotation that\'s not divisible by 90', function () {
    it('should fail', function () {
      const throwable = () => {
        sdk.createOperation('orientation', {
          rotation: 45
        })
      }
      throwable.should.throw('OrientationOperation: `rotation` has to be a multiple of 90.')
    })
  })

  describe('#render', function () {
    it('should succeed', function () {
      sdk.createOperation('orientation', {
        rotation: 90
      })

      return sdk.render()
        .should.be.fulfilled
    })

    it('should correctly resize the canvas', function (done) {
      sdk.createOperation('orientation', {
        rotation: 90
      })

      sdk.export(PhotoEditorSDK.RenderType.IMAGE)
        .then(function (result) {
          result.width.should.equal(image.height)
          result.height.should.equal(image.width)
          done()
        })
        .catch(function (err) {
          done(err)
        })
    })
  })
})
