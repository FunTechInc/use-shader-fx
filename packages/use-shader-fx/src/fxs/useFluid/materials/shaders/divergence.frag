precision highp float;

uniform sampler2D velocity;
uniform float dt;
uniform vec2 texelsize;
varying vec2 vUv;

void main(){
    float x0 = texture2D(velocity, vUv-vec2(texelsize.x, 0)).x;
    float x1 = texture2D(velocity, vUv+vec2(texelsize.x, 0)).x;
    float y0 = texture2D(velocity, vUv-vec2(0, texelsize.y)).y;
    float y1 = texture2D(velocity, vUv+vec2(0, texelsize.y)).y;
    float divergence = (x1-x0 + y1-y0) / 2.0;

    gl_FragColor = vec4(divergence / dt);
}
