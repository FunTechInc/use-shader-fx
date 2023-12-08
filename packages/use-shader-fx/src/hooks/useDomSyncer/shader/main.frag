precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;

void main() {
	vec2 uv = vUv;
	gl_FragColor = vec4(1.0,.0,1.0,1.0);
	gl_FragColor = texture2D(u_texture, uv);
}