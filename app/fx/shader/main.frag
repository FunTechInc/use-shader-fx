precision mediump float;
varying vec2 vUv;
uniform bool isBg;
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
uniform sampler2D u_bgTexture;
uniform sampler2D u_effectTexture;

void main() {
	vec2 uv = vUv;
	vec3 fxmap = texture2D(u_effectTexture, vUv).rgb;
	float effect = mix(mix(fxmap.r, fxmap.g, 0.5), fxmap.b, 0.5);
	uv += effect;
	vec3 texture = texture2D(u_bgTexture, uv).rgb;
	gl_FragColor = isBg ? vec4(texture,1.0) : vec4(fxmap,1.0);
}
