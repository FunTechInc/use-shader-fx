precision highp float;

varying vec2 vUv;
varying vec2 vL2;
varying vec2 vR2;
varying vec2 vT2;
varying vec2 vB2;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main () {
	// TODO * ここvertexの仕組み改善
	float L = texture2D(uPressure, vL2).r;
	float R = texture2D(uPressure, vR2).r;
	float T = texture2D(uPressure, vT2).r;
	float B = texture2D(uPressure, vB2).r;
	
	float divergence = texture2D(uDivergence, vUv).r;

	// float pressure = (L + R + B + T - divergence) * 0.25;
	// gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);

	float pressure = (L + R + B + T) * 0.25 - divergence;
	gl_FragColor = vec4(pressure);
}