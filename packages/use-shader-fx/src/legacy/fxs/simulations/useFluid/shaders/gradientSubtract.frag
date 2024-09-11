precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main () {
	// float L = texture2D(uPressure, clamp(vL,0.,1.)).x;
	// float R = texture2D(uPressure, clamp(vR,0.,1.)).x;
	// float T = texture2D(uPressure, clamp(vT,0.,1.)).x;
	// float B = texture2D(uPressure, clamp(vB,0.,1.)).x;

	float L = texture2D(uPressure, vL).x;
	float R = texture2D(uPressure, vR).x;
	float T = texture2D(uPressure, vT).x;
	float B = texture2D(uPressure, vB).x;

	vec2 velocity = texture2D(uVelocity, vUv).xy;

	// velocity.xy -= vec2(R - L, T - B);

	vec2 gradP = vec2(R - L, T - B) * 0.5;
	velocity = velocity - gradP * 0.016;
	
	gl_FragColor = vec4(velocity, 0.0, 1.0);
}
