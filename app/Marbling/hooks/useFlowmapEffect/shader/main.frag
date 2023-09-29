precision mediump float;

uniform sampler2D tMap;

uniform float uFalloff;
uniform float uAlpha;
uniform float uDissipation;

uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uVelocity;

varying vec2 vUv;

void main() {
	vec4 color = texture2D(tMap, vUv) * uDissipation;
	vec2 cursor = vUv - uMouse;
	cursor.x *= uAspect;
	vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 4.0));

	float modifiedFalloff = uFalloff * length(uVelocity);
	modifiedFalloff = max(modifiedFalloff, 0.0);

	float falloff = smoothstep(modifiedFalloff, 0.0, length(cursor)) * uAlpha;
	color.rgb = mix(color.rgb, stamp, vec3(falloff));
	gl_FragColor = color;
}
