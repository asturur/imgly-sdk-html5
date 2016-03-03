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
        sdk.createOperation('crop', {
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

  describe('#_onOperationUpdate', function () {
    let cropOperation = null
    beforeEach(function () {
      cropOperation = sdk.createOperation('crop', {
        start: new PhotoEditorSDK.Math.Vector2(0.5, 0.5),
        end: new PhotoEditorSDK.Math.Vector2(1, 1)
      })
    })

    describe('when an OrientationOperation is rotating the image', function () {
      describe('by 90 degrees', function () {
        it('should rotate the crop as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(90)

          const start = cropOperation.getStart()
          const end = cropOperation.getEnd()

          start.equals(0, 0.5).should.be.true
          end.equals(0.5, 1).should.be.true
        })
      })

      describe('by -90 degrees', function () {
        it('should rotate the crop as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(-90)

          const start = cropOperation.getStart()
          const end = cropOperation.getEnd()

          start.equals(0.5, 0).should.be.true
          end.equals(1, 0.5).should.be.true
        })
      })
    })

    describe('when an OrientationOperation is flipping the image', function () {
      describe('horizontally', function () {
        it('should flip the crop as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipHorizontally(true)

          const start = cropOperation.getStart()
          const end = cropOperation.getEnd()

          start.equals(0, 0.5).should.be.true
          end.equals(0.5, 1).should.be.true
        })

        describe('when image is already rotated', function () {
          it('should flip the crop correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipHorizontally(true)

            const start = cropOperation.getStart()
            const end = cropOperation.getEnd()

            start.equals(0.5, 0).should.be.true
            end.equals(1, 0.5).should.be.true
          })
        })
      })

      describe('vertically', function () {
        it('should flip the crop as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipVertically(true)

          const start = cropOperation.getStart()
          const end = cropOperation.getEnd()

          start.equals(0.5, 0).should.be.true
          end.equals(1, 0.5).should.be.true
        })

        describe('when image is already rotated', function () {
          it('should flip the crop correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipVertically(true)

            const start = cropOperation.getStart()
            const end = cropOperation.getEnd()

            start.equals(0, 0.5).should.be.true
            end.equals(0.5, 1).should.be.true
          })
        })
      })
    })
  })
})
