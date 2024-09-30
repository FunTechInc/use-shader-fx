uniform float dt;
uniform sampler2D velocity;

void main(){
	vec2 vel = texture2D(velocity, vUv).xy;
	vec2 uv2 = vUv - vel * dt * maxAspect;
	vec2 newVel = texture2D(velocity, uv2).xy;
	gl_FragColor = vec4(newVel, 0.0, 0.0);
}