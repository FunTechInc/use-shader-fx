precision highp float;
varying vec2 vUv;
uniform sampler2D u_noise;
uniform float u_noiseIntensity;
uniform sampler2D u_colorStrata;
uniform sampler2D u_brush;
uniform sampler2D u_funkun;
uniform float u_time;

float rand(vec2 n) { 
	return fract(sin(dot(n ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

	vec2 uv = vUv;
	vec3 funkun = texture2D(u_funkun,uv).rgb;
	
	float grain = rand(uv + sin(u_time)) * .4;
	grain=grain*.5+.5; // .5 ~ 1.

	vec4 noise = texture2D(u_noise, uv);
	vec4 brush = texture2D(u_brush, uv);
	
	uv += brush.rg;
	float brushAlpha = min(brush.r + brush.g + brush.b,1.0);

	uv += noise.rg * u_noiseIntensity;
	vec4 colorStrata = texture2D(u_colorStrata,uv);

	vec3 mixedBrush = mix(brush.rgb , funkun, brushAlpha);

	vec3 mixColor = mix(colorStrata.rgb, mixedBrush, brushAlpha);

	gl_FragColor.rgb = mixColor * grain;
	gl_FragColor.a = 1.0;
}
