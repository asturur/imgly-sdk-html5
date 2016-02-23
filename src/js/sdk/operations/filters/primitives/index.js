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
 * Filter primitives are the core of filters. One filter consists of multiple filter primitives.
 * For an example, look at the implementation of a filter, e.g. {@link PhotoEditorSDK.Filters.A15Filter}
 * or see our documentation at {@link https://www.photoeditorsdk.com/docs}.
 * @namespace PhotoEditorSDK.FilterPrimitives
 */
export default {
  Brightness: require('./brightness'),
  Contrast: require('./contrast'),
  Desaturation: require('./desaturation'),
  Glow: require('./glow'),
  Gobblin: require('./gobblin'),
  Grayscale: require('./grayscale'),
  LookupTable: require('./lookup-table'),
  Saturation: require('./saturation'),
  SoftColorOverlay: require('./soft-color-overlay'),
  ToneCurve: require('./tone-curve'),
  X400: require('./x400')
}
