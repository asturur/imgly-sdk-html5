precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_brightness;
uniform float u_saturation;
uniform float u_contrast;
const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);

  vec4 color = texColor;

  // Apply brightness
  color.rgb = (color.rgb + u_brightness);

  // Apply saturation
  float luminance = dot(color.rgb, luminanceWeighting);
  vec3 greyScaleColor = vec3(luminance);
  color.rgb = mix(greyScaleColor, color.rgb, u_saturation);

  // Apply contrast
  color.rgb = (color.rgb - 0.5) * u_contrast + 0.5;

  // Apply alpha
  color = vec4(color.rgb * texColor.a, texColor.a);

  gl_FragColor = color;
}
