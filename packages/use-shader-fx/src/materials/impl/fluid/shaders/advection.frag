uniform float deltaTime;
uniform sampler2D velocity;
uniform float dissipation;

void main(){
	vec2 vel = texture2D(velocity, vUv).xy;
	vec2 uv2 = vUv - vel * deltaTime * maxAspect;
	vec2 newVel = texture2D(velocity, uv2).xy;
	gl_FragColor = vec4(dissipation * newVel, 0.0, 0.0);
}