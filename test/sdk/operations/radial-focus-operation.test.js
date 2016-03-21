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

  describe('#render', function () {
    it('should succeed', function () {
      this.timeout(10000)
      sdk.createOperation('radial-focus', {
        position: new PhotoEditorSDK.Math.Vector2(0.5, 0.5)
      })

      return sdk.render()
        .should.be.fulfilled
    })
  })

  describe('#_onOperationUpdate', function () {
    let radialFocusOperation = null
    beforeEach(function () {
      radialFocusOperation = sdk.createOperation('radial-focus', {
        position: new PhotoEditorSDK.Math.Vector2(0.1, 0.1)
      })
    })

    describe('when an OrientationOperation is rotating the image', function () {
      describe('by 90 degrees', function () {
        it('should rotate the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(90)

          const position = radialFocusOperation.getPosition()

          position.equals(0.9, 0.1).should.be.true
        })
      })

      describe('by -90 degrees', function () {
        it('should rotate the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(-90)

          const position = radialFocusOperation.getPosition()

          position.equals(0.1, 0.9).should.be.true
        })
      })
    })

    describe('when an OrientationOperation is flipping the image', function () {
      describe('horizontally', function () {
        it('should flip the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipHorizontally(true)

          const position = radialFocusOperation.getPosition()

          position.equals(0.9, 0.1).should.be.true
        })

        describe('when image is already rotated', function () {
          it('should flip the focus correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipHorizontally(true)

            const position = radialFocusOperation.getPosition()

            position.equals(0.1, 0.9).should.be.true
          })
        })
      })

      describe('vertically', function () {
        it('should flip the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipVertically(true)

          const position = radialFocusOperation.getPosition()

          position.equals(0.1, 0.9).should.be.true
        })

        describe('when image is already rotated', function () {
          it('should flip the focus correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipVertically(true)

            const position = radialFocusOperation.getPosition()

            position.equals(0.9, 0.1).should.be.true
          })
        })
      })
    })
  })
})
