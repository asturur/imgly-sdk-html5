/* global PhotoEditorSDK, sinon */
/* eslint-disable no-new */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import path from 'path'
import fs from 'fs'
import canvas from 'canvas'

let image, sdk

describe('PhotoEditorSDK', function () {
  describe('when loading an image with EXIF orientation', function () {
    it('should automatically create a RotationOperation', function () {
      image = new canvas.Image()
      const imagePath = path.resolve(__dirname, 'assets/exif.jpg')
      const imageData = fs.readFileSync(imagePath, 'base64')

      const src = 'data:image/jpeg;base64,' + imageData
      image.src = src
      image.rawSource = src

      sdk = new PhotoEditorSDK('canvas', {
        displayWelcomeMessage: false,
        image
      })

      sdk.getOperationsStack().getStack()[0].should.be.instanceOf(PhotoEditorSDK.Operations.OrientationOperation)
    })
  })

  describe('`displayWelcomeMessage` option', function () {
    describe('set to true', function () {
      before(function () {
        sinon.stub(console, 'log', () => {})
        sdk = new PhotoEditorSDK('canvas', {
          displayWelcomeMessage: true
        })
      })
      after(function () {
        console.log.restore()
      })
      it('should display a welcome message', function () {
        console.log.should.have.been.calledWith(
          'PhotoEditorSDK | Yo! | Version: 3.0.0 (Canvas2D) - https://www.photoeditorsdk.com'
        )
      })
    })
  })

  describe('`debug` option', function () {
    describe('set to true', function () {
      before(function () {
        image = new canvas.Image()
        let imagePath = path.resolve(__dirname, 'assets/test.png')
        let buffer = fs.readFileSync(imagePath)
        image.src = buffer

        sdk = new PhotoEditorSDK('canvas', {
          displayWelcomeMessage: false,
          debug: true,
          image: image
        })

        sinon.stub(console, 'log')
      })
      it('#render should print results about the frame rendering', function () {
        return sdk.render()
          .then(function () {
            console.log.should.have.callCount(5)
            console.log.restore()
          })
      })
    })
  })

  // describe('`perfTest` option', function () {
  //   describe('set to true', function () {
  //     before(function () {
  //       image = new canvas.Image()
  //       let imagePath = path.resolve(__dirname, 'assets/test.png')
  //       let buffer = fs.readFileSync(imagePath)
  //       image.src = buffer
  //
  //       sdk = new PhotoEditorSDK('canvas', {
  //         displayWelcomeMessage: false,
  //         perfTest: true,
  //         image: image
  //       })
  //
  //       sinon.stub(console, 'log')
  //     })
  //     it('#render should print some output', function () {
  //       return sdk.render()
  //         .then(function () {
  //           console.log.should.have.callCount(1)
  //           console.log.restore()
  //         })
  //     })
  //   })
  // })

  describe('#createOperation', function () {
    beforeEach(function () {
      sdk = new PhotoEditorSDK('canvas', {
        displayWelcomeMessage: false
      })
    })
    describe('with a valid identifier', function () {
      it('should return an operation', function () {
        const operation = sdk.createOperation('border')
        operation.should.be.instanceOf(PhotoEditorSDK.Operation)
      })
    })

    describe('with an invalid identifier', function () {
      it('should throw an error', function () {
        const throwable = function () {
          sdk.createOperation('foobarbaz')
        }
        throwable.should.throw(
          'No operation with identifier `foobarbaz` found.'
        )
      })
    })
  })

  describe('#export', function () {
    beforeEach(function () {
      image = new canvas.Image()
      let imagePath = path.resolve(__dirname, 'assets/test.png')
      let buffer = fs.readFileSync(imagePath)
      image.src = buffer

      sdk = new PhotoEditorSDK('canvas', {
        image: image,
        displayWelcomeMessage: false
      })
    })

    describe('validations', function () {
      describe('when an invalid render type is given', function () {
        it('should throw an error', function () {
          return sdk.export('invalid')
            .should.be.rejectedWith(null, 'Invalid render type')
        })
      })

      describe('when an invalid image format is given', function () {
        it('should throw an error', function () {
          return sdk.export(null, 'invalid')
            .should.be.rejectedWith(null, 'Invalid image format')
        })
      })
    }) // validations

    describe('without any operations on the stack', function () {
      it('should return a promise', function () {
        return sdk.export()
          .should.be.fulfilled
      })
    })
  }) // #render
})
