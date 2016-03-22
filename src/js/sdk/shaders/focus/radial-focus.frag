/*!
 * Based on evanw's glfx.js tilt shift shader:
 * https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
 */

precision mediump float;
uniform sampler2D u_image;
uniform float u_radius;
uniform float u_blurRadius;
uniform float u_gradientRadius;
uniform vec2 u_position;
uniform vec2 u_delta;
uniform vec2 u_texSize;
varying vec2 v_texCoord;

float random(vec3 scale, float seed) {
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
    vec4 color = vec4(0.0);
    float total = 0.0;

    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    float radius = smoothstep(
      0.0, 1.0,
      (abs(
        distance(v_texCoord * u_texSize, u_position)
      ) - u_radius) / (u_gradientRadius * 2.0)
    ) * u_blurRadius;
    for (float t = -30.0; t <= 30.0; t++) {
        float percent = (t + offset - 0.5) / 30.0;
        float weight = 1.0 - abs(percent);
        vec4 sample = texture2D(u_image, v_texCoord + u_delta * percent * radius / u_texSize);

        sample.rgb *= sample.a;

        color += sample * weight;
        total += weight;
    }

    gl_FragColor = color / total;
    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
}
