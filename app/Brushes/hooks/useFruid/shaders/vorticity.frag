precision highp float;

uniform vec2 resolution;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;

varying vec2 vUv;

void main(){

	vec2 vT = vUv + vec2(0.0, resolution.y);
	vec2 vB = vUv - vec2(0.0, resolution.y);

	float T = texture2D(uCurl, vT).x;
	float B = texture2D(uCurl, vB).x;
	float C = texture2D(uCurl, vUv).x;
	vec2 force = vec2(abs(T) - abs(B), 0.0);
	force *= 1.0 / length(force + 0.00001) * curl * C;
	vec2 vel = texture2D(uVelocity, vUv).xy;
	
	gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}