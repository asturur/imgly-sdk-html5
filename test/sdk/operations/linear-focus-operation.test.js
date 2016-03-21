/* global PhotoEditorSDK, SpecHelpers, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

describe('LinearFocusOperation', function () {
  let sdk
  beforeEach(function () {
    sdk = SpecHelpers.initSDK()
  })

  describe('#render', function () {
    it('should succeed', function () {
      this.timeout(20000)
      sdk.createOperation('linear-focus')

      return sdk.export()
        .should.be.fulfilled
    })
  })

  describe('#_onOperationUpdate', function () {
    let linearFocusOperation = null
    beforeEach(function () {
      linearFocusOperation = sdk.createOperation('linear-focus', {
        start: new PhotoEditorSDK.Math.Vector2(0.0, 0.5),
        end: new PhotoEditorSDK.Math.Vector2(1.0, 0.5)
      })
    })

    describe('when an OrientationOperation is rotating the image', function () {
      describe('by 90 degrees', function () {
        it('should rotate the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(90)

          const start = linearFocusOperation.getStart()
          const end = linearFocusOperation.getEnd()

          start.equals(0.5, 0).should.be.true
          end.equals(0.5, 1).should.be.true
        })
      })

      describe('by -90 degrees', function () {
        it('should rotate the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(-90)

          const start = linearFocusOperation.getStart()
          const end = linearFocusOperation.getEnd()

          start.equals(0.5, 1).should.be.true
          end.equals(0.5, 0).should.be.true
        })
      })
    })

    describe('when an OrientationOperation is flipping the image', function () {
      describe('horizontally', function () {
        beforeEach(function () {
          linearFocusOperation.set({
            start: new PhotoEditorSDK.Math.Vector2(0, 0),
            end: new PhotoEditorSDK.Math.Vector2(1, 1)
          })
        })

        it('should flip the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipHorizontally(true)

          const start = linearFocusOperation.getStart()
          const end = linearFocusOperation.getEnd()

          start.equals(1, 0).should.be.true
          end.equals(0, 1).should.be.true
        })

        describe('when image is already rotated', function () {
          it('should flip the focus correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipHorizontally(true)

            const start = linearFocusOperation.getStart()
            const end = linearFocusOperation.getEnd()

            start.equals(0, 1).should.be.true
            end.equals(1, 0).should.be.true
          })
        })
      })

      describe('vertically', function () {
        beforeEach(function () {
          linearFocusOperation.set({
            start: new PhotoEditorSDK.Math.Vector2(0, 0),
            end: new PhotoEditorSDK.Math.Vector2(1, 1)
          })
        })

        it('should flip the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipVertically(true)

          const start = linearFocusOperation.getStart()
          const end = linearFocusOperation.getEnd()

          start.equals(0, 1).should.be.true
          end.equals(1, 0).should.be.true
        })

        describe('when image is already rotated', function () {
          it('should flip the focus correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipVertically(true)

            const start = linearFocusOperation.getStart()
            const end = linearFocusOperation.getEnd()

            start.equals(1, 0).should.be.true
            end.equals(0, 1).should.be.true
          })
        })
      })
    })
  })
})
