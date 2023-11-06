precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform float uVelocity;
uniform float uSomeValue;

void main() {
	vec2 uv = vUv;
	gl_FragColor = vec4(sin(uTime),uVelocity,uSomeValue,1.0);
}