precision highp float;
varying vec2 vUv;
uniform sampler2D u_fx;
uniform float u_time;
uniform float u_floor;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_saturation;

uniform float u_noiseStrength;
uniform vec2 u_floorStrength;

float rand(vec2 n) { 
	return fract(sin(dot(n ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	vec2 uv = vUv;

	float noise = rand(vUv + sin(u_time)) * u_noiseStrength;
	noise=noise*.5+.5; // .5 ~ 1.

	float posY = floor(uv.y * u_floor);
	float posMap = mod(posY, 2.) == 0. ? 1. : -1.;
	uv.x += posMap * u_floorStrength.x * .01;
	uv.y += posMap * u_floorStrength.y * .01;
	
	vec4 color = texture2D(u_fx, uv);

	color = ((color-.5)*u_contrast)+.5;

	gl_FragColor = vec4(vec3(clamp(color * noise,0.,1.)),color.a);
}