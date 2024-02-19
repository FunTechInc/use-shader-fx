precision highp float;
varying vec2 vUv;
uniform sampler2D u_fx;

void main() {
	vec2 uv = vUv;
	
	vec4 fx = texture2D(u_fx, uv);

	gl_FragColor = fx;
}