precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform sampler2D u_frameImage;
uniform vec4 u_color;
uniform float u_thickness;
uniform vec2 u_textureSize;

void main() {
  vec4 fragColor = texture2D(u_image, v_texCoord);
  float scaledThicknessX = u_thickness / u_textureSize.x;
  float scaledThicknessY = u_thickness / u_textureSize.y;
  if (v_texCoord.x < scaledThicknessX ||
    v_texCoord.x > 1.0 - scaledThicknessX ||
    v_texCoord.y < scaledThicknessY || v_texCoord.y > 1.0 - scaledThicknessY) {
      fragColor = u_color;
    }

  gl_FragColor = fragColor;
}
