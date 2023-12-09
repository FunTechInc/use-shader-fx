precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_textureResolution;
uniform vec2 u_resolution;

void main() {
	vec2 ratio=vec2(
		min((u_resolution.x/u_resolution.y)/(u_textureResolution.x/u_textureResolution.y),1.),
		min((u_resolution.y/u_resolution.x)/(u_textureResolution.y/u_textureResolution.x),1.)
	);
	vec2 uv=vec2(
		vUv.x*ratio.x+(1.-ratio.x)*.5,
		vUv.y*ratio.y+(1.-ratio.y)*.5
	);
	gl_FragColor = texture2D(u_texture, uv);
}