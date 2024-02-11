precision highp float;
varying vec2 vUv;
uniform sampler2D u_fx;

void main() {
	gl_FragColor = texture2D(u_fx, vUv);
}