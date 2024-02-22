precision highp float;
varying vec2 vUv;
uniform sampler2D u_tex;

void main() {
	gl_FragColor = texture2D(u_tex, vUv);
}