precision mediump float;
varying vec2 vUv;
uniform sampler2D u_bufferTexture;
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
uniform sampler2D u_bgTexture;

void main() {
	vec2 bgRatio=vec2(
		min((u_resolution.x/u_resolution.y)/(u_imageResolution.x/u_imageResolution.y),1.),
		min((u_resolution.y/u_resolution.x)/(u_imageResolution.y/u_imageResolution.x),1.)
	);
	vec2 uv=vec2(
		vUv.x*bgRatio.x+(1.-bgRatio.x)*.5,
		vUv.y*bgRatio.y+(1.-bgRatio.y)*.5
	);
	vec3 map = texture2D(u_bufferTexture, vUv).rgb * 1.0;
	float effect = mix(mix(map.r, map.g, 0.5), map.b, 0.5);
	uv += effect;
	vec3 texture = texture2D(u_bgTexture, uv).rgb;

	// gl_FragColor = vec4(texture,1.0);
	gl_FragColor = vec4(map,1.0);
}