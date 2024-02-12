precision highp float;
varying vec2 vUv;
uniform sampler2D u_fx;
uniform sampler2D u_noise;
uniform float u_noiseIntensity;

void main() {
	vec2 uv = vUv;

	vec4 noise = texture2D(u_noise, uv);

	uv += noise.rg * u_noiseIntensity;

	vec4 fx = texture2D(u_fx, uv);

	gl_FragColor = fx;
}