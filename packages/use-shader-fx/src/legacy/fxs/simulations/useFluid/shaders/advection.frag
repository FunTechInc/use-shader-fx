precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 resolution;
uniform float dt;
uniform float dissipation;

void main () {
	vec2 ratio = max(resolution.x, resolution.y) / resolution;
	vec2 vel = texture2D(uVelocity, vUv).xy;
	// vec2 coord = vUv - dt * vel * texelSize; // TODO * ここvec2 ratio = max(fboSize.x, fboSize.y) / fboSize;の方がいいのかな？一緒だと思うけど。検証の余地あるかも
	vec2 coord = vUv - dt * vel * ratio;
	gl_FragColor = vec4(texture2D(uSource, coord).rgb,1.);
}