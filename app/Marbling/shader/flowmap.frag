precision mediump float;

uniform sampler2D u_bufferTexture;
uniform float u_falloff;
uniform float u_alpha;
uniform float u_dissipation;
uniform vec2 u_pointer;
uniform vec2 u_velocity;
uniform float u_easing;
varying vec2 vUv;
float PI = 3.141592;

void main() {
	vec4 color = texture2D(u_bufferTexture, vUv) * u_dissipation;
	vec2 cursor = vUv - u_pointer;
	vec3 stamp = vec3(u_velocity * vec2(1.5, -1), u_easing - pow(1. - min(1., length(u_velocity)), 1.));
	float falloff = smoothstep(u_falloff, 0.0, length(cursor)) * u_alpha;
	color.rgb = mix(color.rgb, stamp, vec3(falloff));
	gl_FragColor = color;
}