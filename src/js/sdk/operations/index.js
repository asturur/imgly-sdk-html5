/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

/**
 * @namespace PhotoEditorSDK.Operations
 */
export default {
  FilterOperation: require('./filter-operation'),
  CropOperation: require('./crop-operation'),
  OrientationOperation: require('./orientation-operation'),
  AdjustmentsOperation: require('./adjustments-operation'),
  TiltShiftOperation: require('./tilt-shift-operation'),
  RadialBlurOperation: require('./radial-blur-operation'),
  FrameOperation: require('./frame-operation'),
  SpriteOperation: require('./sprite-operation'),
  WatermarkOperation: require('./watermark-operation'),
  BrushOperation: require('./brush-operation')
}
