/* global PhotoEditorSDK, describe, it, beforeEach */
'use strict'
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const { Color } = PhotoEditorSDK
var color

describe('Color', function () {
  beforeEach(function () {
    color = new Color(1.0, 0.0, 0.0, 1.0)
  })

  describe('#constructor', function () {
    describe('when no alpha is given', function () {
      it('should set the alpha to 1.0', function () {
        var newColor = new Color(1.0, 0.0, 0.0)
        newColor.a.should.equal(1)
      })
    })
  })

  describe('#toRGBA', function () {
    it('should return an rgba() representation of the color', function () {
      color.toRGBA().should.equal('rgba(255,0,0,1)')
    })
  })

  describe('#toHex', function () {
    it('should return a hex representation of the color', function () {
      color.toHex().should.equal('#ff0000')
    })
  })

  describe('#toGLColor', function () {
    it('should return an array with 0..1 values', function () {
      var gl = color.toGLColor()
      gl[0].should.equal(1.0)
      gl[1].should.equal(0.0)
      gl[2].should.equal(0.0)
      gl[3].should.equal(1.0)
    })
  })

  describe('#toRGBGLColor', function () {
    it('should return an array with 0..1 values', function () {
      var gl = color.toRGBGLColor()
      gl[0].should.equal(1.0)
      gl[1].should.equal(0.0)
      gl[2].should.equal(0.0)
    })
  })

  describe('#toHSV', function () {
    it('should return an array with HSV values', function () {
      var hsv = color.toHSV()
      hsv[0].should.equal(0.0)
      hsv[1].should.equal(1.0)
      hsv[2].should.equal(1.0)
    })

    describe('with maximum value being the minimum value', function () {
      it('should be achromatic', function () {
        color.r = color.g = color.b = 0
        const hsv = color.toHSV()
        hsv[0].should.equal(0.0)
      })
    })

    describe('with R being the maximum value and G < B', function () {
      it('should correctly calculate hue', function () {
        color.r = 1.0
        color.g = 0
        color.b = 0.5
        const hsv = color.toHSV()
        hsv[0].toFixed(2).should.equal('0.92')
      })
    })

    describe('with G being the maximum value', function () {
      it('should correctly calculate hue', function () {
        color.r = color.b = 0
        color.g = 1
        const hsv = color.toHSV()
        hsv[0].toFixed(2).should.equal('0.33')
      })
    })

    describe('with B being the maximum value', function () {
      it('should correctly calculate hue', function () {
        color.r = color.g = 0
        color.b = 1
        const hsv = color.toHSV()
        hsv[0].toFixed(2).should.equal('0.67')
      })
    })
  })

  describe('#fromHSV', function () {
    it('should set the RGB values according to the given HSV values', function () {
      color = Color.fromHSV(0, 1, 1)
      color.r.should.equal(1)
      color.g.should.equal(0)
      color.b.should.equal(0)
    })

    describe('with (h * 6) % 6 === 1', function () {
      it('should correctly calculate RGB values', function () {
        color = Color.fromHSV(0.2, 1, 1)
        color.r.toFixed(2).should.equal('0.80')
        color.g.should.equal(1)
        color.b.should.equal(0)
      })
    })

    describe('with (h * 6) % 6 === 2', function () {
      it('should correctly calculate RGB values', function () {
        color = Color.fromHSV(0.4, 1, 1)
        color.r.should.equal(0)
        color.g.should.equal(1)
        color.b.toFixed(2).should.equal('0.40')
      })
    })

    describe('with (h * 6) % 6 === 3', function () {
      it('should correctly calculate RGB values', function () {
        color = Color.fromHSV(0.6, 1, 1)
        color.r.should.equal(0)
        color.g.toFixed(2).should.equal('0.40')
        color.b.should.equal(1)
      })
    })

    describe('with (h * 6) % 6 === 4', function () {
      it('should correctly calculate RGB values', function () {
        color = Color.fromHSV(0.8, 1, 1)
        color.r.toFixed(2).should.equal('0.80')
        color.g.should.equal(0)
        color.b.should.equal(1)
      })
    })

    describe('with (h * 6) % 6 === 5', function () {
      it('should correctly calculate RGB values', function () {
        color = Color.fromHSV(0.9, 1, 1)
        color.r.should.equal(1)
        color.g.should.equal(0)
        color.b.toFixed(2).should.equal('0.60')
      })
    })
  })

  describe('#equals', function () {
    describe('when color equals the given one', function () {
      it('should return true', function () {
        color.equals(new Color(1, 0, 0, 1)).should.equal(true)
      })
    })

    describe('when color does not equal the given one', function () {
      it('should return false', function () {
        color.equals(new Color(0, 0, 0, 1)).should.equal(false)
      })
    })
  })

  describe('#clone', function () {
    it('should return a new object with the same values', function () {
      var newColor = color.clone()
      newColor.should.not.equal(color) // not the same object
      newColor.r.should.equal(color.r)
      newColor.g.should.equal(color.g)
      newColor.b.should.equal(color.b)
    })
  })

  describe('#toString', function () {
    it('should return a string representation of the color', function () {
      var str = color.toString()
      str.should.equal('Color(1, 0, 0, 1)')
    })
  })
})
