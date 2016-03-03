/* global PhotoEditorSDK, SpecHelpers, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

describe('CropOperation', function () {
  let sdk, image

  beforeEach(function () {
    sdk = SpecHelpers.initSDK()
    image = sdk.getImage()
  })

  describe('#render', function () {
    describe('with both start and end set', function () {
      it('should correctly resize the canvas', function (done) {
        const operation = sdk.createOperation('crop', {
          start: new PhotoEditorSDK.Math.Vector2(0.1, 0.1),
          end: new PhotoEditorSDK.Math.Vector2(0.9, 0.9)
        })

        sdk.export(PhotoEditorSDK.RenderType.IMAGE)
          .then(function (result) {
            result.width.should.equal(image.width * 0.8)
            result.height.should.equal(image.height * 0.8)

            done()
          })
          .catch(function (err) {
            done(err)
          })
      })
    })
  })
})
