/* global SpecHelpers, describe, it, beforeEach */
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
  let sdk, operation

  describe('stickers', function () {
    let stickerImage
    const addSticker = function (options = {}) {
      options.image = stickerImage
      const sticker = operation.createSticker(options)
      operation.addSprite(sticker)
    }

    beforeEach(function () {
      sdk = SpecHelpers.initSDK()

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
    let stickerImage
    beforeEach(function () {
      sdk = SpecHelpers.initSDK()

      const stickerPath = path.resolve(__dirname, '../assets/sticker.png')
      const stickerImageBuffer = fs.readFileSync(stickerPath)
      stickerImage = new Image()
      stickerImage.src = stickerImageBuffer

      operation = sdk.createOperation('sprite')
      const text = operation.createText({
        text: 'This is an example text.'
      })
      operation.addSprite(text)
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
})
