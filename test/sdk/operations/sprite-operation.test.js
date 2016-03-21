/* global PhotoEditorSDK, SpecHelpers, describe, it, beforeEach, afterEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import fs from 'fs'
import path from 'path'
import { Image } from 'canvas'

describe('SpriteOperation', function () {
  let sdk, operation, stickerImage

  const addSticker = function (options = {}) {
    options.image = stickerImage
    const sticker = operation.createSticker(options)
    operation.addSprite(sticker)
    return sticker
  }

  const addText = function (options = {}) {
    options.text = 'This is an example text.'
    const text = operation.createText(options)
    operation.addSprite(text)
    return text
  }

  beforeEach(function () {
    sdk = SpecHelpers.initSDK()
    operation = sdk.createOperation('sprite')
  })

  afterEach(function () {
    sdk.getOperationsStack().clear()
  })

  describe('stickers', function () {
    beforeEach(function () {
      const stickerPath = path.resolve(__dirname, '../assets/sticker.png')
      const stickerImageBuffer = fs.readFileSync(stickerPath)
      stickerImage = new Image()
      stickerImage.src = stickerImageBuffer
    })

    describe('without adjustments or flip', function () {
      describe('#render', function () {
        it('should succeed', function () {
          operation = sdk.createOperation('sprite')
          addSticker()

          return sdk.render()
            .should.be.fulfilled
        })
      })
    })

    describe('with adjustments', function () {
      describe('#render', function () {
        it('should succeed', function () {
          operation = sdk.createOperation('sprite')
          addSticker({
            adjustments: {
              brightness: 0.5,
              contrast: 1.5,
              saturation: 0.5
            }
          })

          return sdk.render()
            .should.be.fulfilled
        })
      })
    })

    describe('with flipped set to true', function () {
      describe('#render', function () {
        it('should succeed', function () {
          operation = sdk.createOperation('sprite')
          addSticker({
            flipHorizontally: true,
            flipVertically: true
          })

          return sdk.render()
            .should.be.fulfilled
        })
      })
    })
  })

  describe('texts', function () {
    beforeEach(function () {
      sdk = SpecHelpers.initSDK()

      operation = sdk.createOperation('sprite')
      addText()
    })

    describe('without adjustments or flip', function () {
      describe('#render', function () {
        it('should succeed', function () {
          operation = sdk.createOperation('sprite')

          return sdk.render()
            .should.be.fulfilled
        })
      })
    })
  })

  describe('#removeSprite', function () {
    let [text1, text2] = []
    beforeEach(function () {
      text1 = addText()
      text2 = addText()
    })

    it('should remove the given sprite', function () {
      operation.getSprites().length.should.equal(2)
      operation.removeSprite(text1)
      operation.getSprites().length.should.equal(1)
      operation.getSprites()[0].should.equal(text2)
    })
  })

  describe('#getSpriteAtPosition', function () {
    describe('with valid coordinates', function () {
      it('should return the top sprite', function () {
        const text1 = addText()
        text1.update(sdk)
        const text2 = addText()
        text2.update(sdk)

        const position = new PhotoEditorSDK.Math.Vector2(1, 1)
        const text = operation.getSpriteAtPosition(sdk, position, PhotoEditorSDK.Operations.SpriteOperation.Text)

        text.should.equal(text2)
      })
    })
  })

  describe('#_onOperationUpdate', function () {
    let sticker = null
    beforeEach(function () {
      sticker = addSticker({
        position: new PhotoEditorSDK.Math.Vector2(10, 10)
      })
    })

    describe('when a CropOperation is cropping the image', function () {
      it('should reposition the sticker', function () {
        const cropOperation = sdk.createOperation('crop')
        cropOperation.set({
          start: new PhotoEditorSDK.Math.Vector2(0.1, 0.1),
          end: new PhotoEditorSDK.Math.Vector2(1, 1)
        })

        const position = sticker.getPosition()
        position.equals(-40, -40).should.be.true
      })
    })

    describe('when an OrientationOperation is rotating the image', function () {
      describe('by 90 degrees', function () {
        it('should rotate the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(90)

          const position = sticker.getPosition()
          position.equals(490, 10).should.be.true

          sdk.removeOperation(orientationOperation)
        })
      })

      describe('by -90 degrees', function () {
        it('should rotate the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setRotation(-90)

          const position = sticker.getPosition()
          position.equals(10, 490).should.be.true
        })
      })
    })

    describe('when an OrientationOperation is flipping the image', function () {
      describe('horizontally', function () {
        it('should flip the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipHorizontally(true)

          const position = sticker.getPosition()
          position.equals(490, 10).should.be.true
        })

        describe('when image is already rotated', function () {
          it('should flip the focus correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipHorizontally(true)

            const position = sticker.getPosition()
            position.equals(10, 490).should.be.true
          })
        })
      })

      describe('vertically', function () {
        it('should flip the focus as well', function () {
          const orientationOperation = sdk.createOperation('orientation')
          orientationOperation.setFlipVertically(true)

          const position = sticker.getPosition()
          position.equals(10, 490).should.be.true
        })

        describe('when image is already rotated', function () {
          it('should flip the focus correctly', function () {
            const orientationOperation = sdk.createOperation('orientation', {
              rotation: 90
            })
            orientationOperation.setFlipVertically(true)

            const position = sticker.getPosition()
            position.equals(490, 10).should.be.true
          })
        })
      })
    })
  })
})
