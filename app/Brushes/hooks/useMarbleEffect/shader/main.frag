precision mediump float;

uniform sampler2D tMap;

uniform float uRadius;
uniform float uAlpha;
uniform float uDissipation;
uniform float uMagnification;

uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uVelocity;

varying vec2 vUv;

void main() {

	// buffer color
	vec4 bufferColor = texture2D(tMap, vUv) * uDissipation;
	
	//	color
	vec3 color = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 1.0));
	// vec3 color = vec3(1.0,1.0,1.0);

	// cursor
	vec2 cursor = vUv - uMouse;
	cursor.x *= uAspect;

	// radius
	float modifiedRadius = uRadius + (length(uVelocity) * uMagnification);
	modifiedRadius = max(0.0,modifiedRadius);
	float finalBrush = smoothstep(modifiedRadius,0.0,length(cursor)) * uAlpha;

	// mix buffer and current color
	bufferColor.rgb = mix(bufferColor.rgb, color, vec3(finalBrush));

	gl_FragColor = bufferColor;
}