precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform sampler2D u_frameImage;
uniform vec4 u_color;
uniform vec2 u_thickness;
uniform vec2 u_textureSize;

void main() {
  vec4 fragColor = texture2D(u_image, v_texCoord);
  vec2 scaledThickness = u_thickness / u_textureSize;
  if (v_texCoord.x < scaledThickness.x ||
    v_texCoord.x > 1.0 - scaledThickness.x ||
    v_texCoord.y < scaledThickness.y || v_texCoord.y > 1.0 - scaledThickness.y) {
      fragColor = mix(fragColor, u_color, u_color.a);
    }

  gl_FragColor = fragColor;
}
