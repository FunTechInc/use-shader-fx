precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
	vec2 uv = vUv;	
	vec4 texColor = texture2D(uTexture, uv);
	gl_FragColor = vec4(1.,.4,.3,1.);
}