precision highp float;

uniform vec2 resolution;
uniform sampler2D uVelocity;

varying vec2 vUv;

void main(){

	vec2 vL = vUv - vec2(resolution.x, 0.0);
	vec2 vR = vUv + vec2(resolution.x, 0.0);
	vec2 vT = vUv + vec2(0.0, resolution.y);
	vec2 vB = vUv - vec2(0.0, resolution.y);

	float L = texture2D(uVelocity, vL).y;
	float R = texture2D(uVelocity, vR).y;
	float T = texture2D(uVelocity, vT).x;
	float B = texture2D(uVelocity, vB).x;

	float vorticity = R - L - T + B;
	gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
}