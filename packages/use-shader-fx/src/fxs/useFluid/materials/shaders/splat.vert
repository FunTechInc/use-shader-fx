precision highp float;

uniform vec2 center;
uniform vec2 scale;
uniform vec2 texelsize;
varying vec2 vUv;

void main(){
	vec2 pos = position.xy * scale * 2.0 * texelsize + center;
	vUv = uv;
	gl_Position = vec4(pos, 0.0, 1.0);
}