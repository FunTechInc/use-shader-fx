precision highp float;
varying vec2 vUv;
uniform sampler2D u_noise;
uniform float u_noiseIntensity;
uniform sampler2D u_colorStrata;
uniform sampler2D u_grain;
uniform sampler2D u_brush;

void main() {

	vec2 uv = vUv;
	vec4 grain = texture2D(u_grain, uv);
	vec4 noise = texture2D(u_noise, uv);
	vec4 brush = texture2D(u_brush, uv);
	
	uv += grain.rg;
	uv += noise.rg * u_noiseIntensity;
	vec4 colorStrata = texture2D(u_colorStrata,uv);

	vec4 mixColor = mix(colorStrata, brush, brush.a);

	gl_FragColor = mixColor;
	gl_FragColor.a = 1.0;
}