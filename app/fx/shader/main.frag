precision mediump float;
varying vec2 vUv;
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
uniform sampler2D u_fx;
uniform sampler2D u_postFx;
uniform bool isBgActive;

void main() {
	vec2 uv = vUv;

	//fx
	vec3 fxmap = texture2D(u_fx, vUv).rgb;
	float fx = mix(mix(fxmap.r, fxmap.g, 0.5), fxmap.b, 0.5);
	uv += fx;

	//post fx
	vec3 postFx = texture2D(u_postFx, uv).rgb;
	
	gl_FragColor = isBgActive ? vec4(postFx,1.0) : vec4(fxmap,1.0);

}
