/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
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
  Filter: require('./filter-operation'),
  Crop: require('./crop-operation'),
  Orientation: require('./orientation-operation'),
  Adjustments: require('./adjustments-operation'),
  TiltShift: require('./tilt-shift-operation'),
  RadialBlur: require('./radial-blur-operation'),
  Frame: require('./frame-operation'),
  Sprite: require('./sprite-operation'),
  Watermark: require('./watermark-operation'),
  Brush: require('./brush-operation')
}
