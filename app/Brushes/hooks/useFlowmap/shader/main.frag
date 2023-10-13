precision mediump float;

uniform sampler2D tMap;

uniform float uRadius;
uniform float uAlpha;
uniform float uDissipation;
uniform float uMagnification;
uniform vec2 uResolution;

uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uVelocity;

varying vec2 vUv;

void main() {

	vec2 st = vUv * 2.0 - 1.0; // UV座標を[-1, 1]の範囲に変換


	vec2 vel = uVelocity * uResolution;

	// buffer color
	vec4 bufferColor = texture2D(tMap, vUv) * uDissipation;
	
	//	color
	vec3 color = vec3(vel * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(vel)), 1.0));
	// vec3 color = vec3(1.0,1.0,1.0);

	// cursor
	vec2 nMouse = (uMouse + vec2(1.0)) * 0.5;
	vec2 cursor = vUv - nMouse;
	cursor.x *= uAspect;

	// radius
	float modifiedRadius = uRadius + (length(vel) * uMagnification);
	modifiedRadius = max(0.0,modifiedRadius);
	float finalBrush = smoothstep(modifiedRadius,0.0,length(cursor)) * uAlpha;

	// mix buffer and current color
	bufferColor.rgb = mix(bufferColor.rgb, color, vec3(finalBrush));

	gl_FragColor = bufferColor;
}