precision mediump float;

uniform sampler2D tMap;

uniform float uRadius;
uniform float uAlpha;
uniform float uDissipation;
uniform float uMagnification;
uniform vec2 uResolution;

uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uVelocity;

varying vec2 vUv;

bool isOnLine(vec2 point, vec2 start, vec2 end, float width) {
	vec2 dir = normalize(end - start);
	vec2 n = vec2(dir.y, -dir.x);  // 線の法線ベクトル
	vec2 p0 = point - start;
	
	float distToLine = abs(dot(p0, n));
	float distAlongLine = dot(p0, dir);
	float totalLength = length(end - start);

	//始点と終点の円の半径も
	float distFromStart = length(point - start);
	float distFromEnd = length(point - end);

	return (distToLine < width && distAlongLine > 0.0 && distAlongLine < totalLength) || distFromStart < width || distFromEnd < width;
}

void main() {

	vec2 st = vUv * 2.0 - 1.0; // UV座標を[-1, 1]の範囲に変換

	vec2 velocity = uVelocity * uResolution;

	// buffer color
	vec4 bufferColor = texture2D(tMap, vUv) * uDissipation;
	
	//	color
	// vec3 color = vec3(velocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(velocity)), 1.0));
	vec3 color = vec3(1.0,1.0,1.0);

	// cursor
	vec2 cursor = st - uMouse;
	cursor.x *= uAspect;
	// vec2 nMouse = (uMouse + vec2(1.0)) * 0.5;
	// nMouse.x *= uAspect;
	// vec2 nPrevMouse = (uPrevMouse + vec2(1.0)) * 0.5;
	// nPrevMouse.x *= uAspect;

	// radius
	// float modifiedRadius = uRadius + (length(velocity) * uMagnification);
	float modifiedRadius = uRadius;
	modifiedRadius = max(0.0,modifiedRadius);
	float finalBrush = smoothstep(modifiedRadius,0.0,length(cursor)) * uAlpha;

	bool onLine = isOnLine(st, uPrevMouse, uMouse, modifiedRadius);
	// finalBrush += float(onLine);
	// bufferColor.rgb = mix(bufferColor.rgb, color, float(onLine));
	bufferColor.rgb = mix(bufferColor.rgb, color, vec3(finalBrush));
	// bufferColor.rgb = mix(bufferColor.rgb, color, 0.5);
	gl_FragColor = bufferColor;
	// gl_FragColor = vec4(uMouse,1.0,1.0);
}