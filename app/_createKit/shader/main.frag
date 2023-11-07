precision mediump float;
varying vec2 vUv;
uniform sampler2D u_fx;

void main() {
	vec2 uv = vUv;
	gl_FragColor = texture2D(u_fx, uv);
}
