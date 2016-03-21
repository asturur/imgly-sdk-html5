/* global PhotoEditorSDK, SpecHelpers, describe, it, beforeEach, afterEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

describe('BrushOperation', function () {
  let sdk, operation

  beforeEach(function () {
    sdk = SpecHelpers.initSDK()
    operation = sdk.createOperation('brush')
  })

  afterEach(function () {
    sdk.getOperationsStack().clear()
  })

  describe('#render', function () {
    describe('with a path', function () {
      it('should succeed', function () {
        const path = operation.createPath(10, new PhotoEditorSDK.Color(1, 0, 0, 1))
        path.addControlPoint(new PhotoEditorSDK.Math.Vector2(100, 100))
        path.addControlPoint(new PhotoEditorSDK.Math.Vector2(200, 100))

        return sdk.render()
          .should.be.fulfilled
      })
    })
  })

  describe('#_onOperationUpdate', function () {
    let controlPoints = null
    beforeEach(function () {
      const path = operation.createPath(10, new PhotoEditorSDK.Color(1, 0, 0, 1))
      path.addControlPoint(new PhotoEditorSDK.Math.Vector2(100, 100))
      path.addControlPoint(new PhotoEditorSDK.Math.Vector2(200, 100))
      controlPoints = path.getControlPoints()
    })

    describe('when a CropOperation is cropping the image', function () {
      it('should reposition the control points', function () {
        const cropOperation = sdk.createOperation('crop')
        cropOperation.set({
          start: new PhotoEditorSDK.Math.Vector2(0.1, 0.1),
          end: new PhotoEditorSDK.Math.Vector2(1, 1)
        })

        controlPoints[0].getPosition().equals(50, 50).should.be.true
        controlPoints[1].getPosition().equals(150, 50).should.be.true
      })
    })

    describe('when an OrientationOperation is rotating the image', function () {
      describe('by 90 degrees', function () {
        it('should rotate the control points as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(90)

          controlPoints[0].getPosition().equals(400, 100)
          controlPoints[1].getPosition().equals(400, 200)
        })
      })

      describe('by -90 degrees', function () {
        it('should rotate the control points as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(-90)

          controlPoints[0].getPosition().equals(100, 400)
          controlPoints[1].getPosition().equals(100, 300)
        })
      })
    })

    describe('when an OrientationOperation is flipping the image', function () {
      describe('horizontally', function () {
        it('should flip the control points as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipHorizontally(true)

          controlPoints[0].getPosition().equals(400, 400)
          controlPoints[1].getPosition().equals(300, 100)
        })

        describe('when image is already rotated', function () {
          it('should flip the control points correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipHorizontally(true)

            controlPoints[0].getPosition().equals(100, 400)
            controlPoints[1].getPosition().equals(200, 400)
          })
        })
      })

      describe('vertically', function () {
        it('should flip the control points as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipVertically(true)

          controlPoints[0].getPosition().equals(100, 400)
          controlPoints[1].getPosition().equals(200, 400)
        })

        describe('when image is already rotated', function () {
          it('should flip the control points correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipVertically(true)

            controlPoints[0].getPosition().equals(400, 100)
            controlPoints[1].getPosition().equals(300, 100)
          })
        })
      })
    })
  })
})
