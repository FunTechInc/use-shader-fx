precision highp float;
varying vec2 vUv;
uniform sampler2D u_noise;
uniform float u_noiseIntensity;
uniform sampler2D u_colorStrata;

float rand(vec2 n) { 
	return fract(sin(dot(n ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

	vec2 uv = vUv;
	float grain = rand(uv) * 0.1;
	vec4 noise = texture2D(u_noise, uv);
	
	uv += grain;
	uv += noise.rg * u_noiseIntensity;
	vec4 colorStrata = texture2D(u_colorStrata,uv);

	gl_FragColor = colorStrata;
	gl_FragColor.a = 1.0;
}