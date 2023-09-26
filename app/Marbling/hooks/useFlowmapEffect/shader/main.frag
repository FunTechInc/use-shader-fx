precision highp float;

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
	//pointerの値を0~1に正規化しなおす
	// vec2 normalizedMouse = (uMouse + 1.0) * 0.5;
	vec2 cursor = vUv - uMouse;
	// vec2 cursor = uMouse;
	cursor.x *= uAspect;

	vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
	float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;

	color.rgb = mix(color.rgb, stamp, vec3(falloff));

	gl_FragColor = color;
}