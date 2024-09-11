precision highp float;

uniform vec2 point;
uniform float radius;
uniform vec2 texelSize;

varying vec2 vUv;

void main(){
    vUv = uv;
    vec2 pos = position.xy * radius * 2.0 * texelSize + point;
    gl_Position = vec4(pos,0., 1.0);
}