precision highp float;

uniform float dt;
uniform vec2 ratio;
uniform sampler2D velocity;

varying vec2 vUv;

void main(){
	vec2 vel = texture2D(velocity, vUv).xy;
	vec2 uv2 = vUv - vel * dt * ratio;
	vec2 newVel = texture2D(velocity, uv2).xy;
	gl_FragColor = vec4(newVel, 0.0, 0.0);
}