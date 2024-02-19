precision highp float;

uniform sampler2D uMap;
uniform sampler2D uTexture;
uniform float uRadius;
uniform float uDissipation;
uniform vec2 uResolution;
uniform float uSmudge;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uVelocity;
uniform vec3 uColor;
uniform float uMotionBlur;
uniform int uMotionSample;

varying vec2 vUv;

float isOnLine(vec2 point, vec2 start, vec2 end, float width, float aspect) {
	// make circle
	point.x *= aspect;
	start.x *= aspect;
	end.x *= aspect;

	// unit vector in direction
	vec2 dir = normalize(end - start);
	
	// unit vector perpendicular to the line segment
	vec2 n = vec2(dir.y, -dir.x);

	vec2 p0 = point - start;
	
	// calculate distance on a line
	float distToLine = abs(dot(p0, n));
	float distAlongLine = dot(p0, dir);
	float totalLength = length(end - start);

	// Include the radius of the circle at the start and end points in the range
	float distFromStart = length(point - start);
	float distFromEnd = length(point - end);
	
	bool withinLine = (distToLine < width && distAlongLine > 0.0 && distAlongLine < totalLength) || distFromStart < width || distFromEnd < width;

	return float(withinLine);
}

// IDEA : マルチサンプリングしてるんだけど、もっといい方法ありそうだけどな〜
// IDEA ; 普通にマウスからの距離でいけないかな〜
vec4 createSmudge(){
	vec2 offsets[9];
	offsets[0] = vec2(-1, -1); offsets[1] = vec2( 0, -1); offsets[2] = vec2( 1, -1);
	offsets[3] = vec2(-1,  0); offsets[4] = vec2( 0,  0); offsets[5] = vec2( 1,  0);
	offsets[6] = vec2(-1,  1); offsets[7] = vec2( 0,  1); offsets[8] = vec2( 1,  1);
	// Scale offset to texture size
	for(int i = 0; i < 9; i++) {
		offsets[i] = (offsets[i] * uSmudge) / uResolution;
	}	
	vec4 smudgedColor = vec4(0.0);
	for(int i = 0; i < 9; i++) {
		smudgedColor += texture2D(uMap, vUv + offsets[i]);
	}
	return smudgedColor / 9.0;
}

//IDEA : 速度からサンプリングして擬似的なモーションブラーしてるんだけど、ここで速度による拡散作れないかな〜
vec4 createMotionBlur(vec4 baseColor, vec2 velocity, float motion, int samples) {
	vec4 motionBlurredColor = baseColor;
	vec2 scaledVelocity = velocity * motion;
	for(int i = 1; i < samples; i++) {
		float t = float(i) / float(samples - 1);
		vec2 offset = t * scaledVelocity / uResolution;
		motionBlurredColor += texture2D(uMap, vUv + offset);
	}
	return motionBlurredColor / float(samples);
}

void main() {
	vec2 st = vUv * 2.0 - 1.0;
	
	// velocity vector
	vec2 velocity = uVelocity * uResolution;

	// add smudge
	vec4 smudgedColor = createSmudge();
	
	// add motion blur
	vec4 motionBlurredColor = createMotionBlur(smudgedColor, velocity, uMotionBlur,uMotionSample);

	vec4 bufferColor = motionBlurredColor * uDissipation;

	// radius
	float modifiedRadius = max(0.0,uRadius);

	//	color 
	vec3 color = uColor;

	// map texture to color
	// TODO：ここのミックスもよう使い勝手わるい
	vec4 textureColor = texture2D(uTexture, vUv);
	vec3 finalColor = mix(color, textureColor.rgb, textureColor.a);

	// ここ0 || 1で かえって来る
	float onLine = length(uVelocity) > 0. ? isOnLine(st, uPrevMouse, uMouse, modifiedRadius, uAspect) : .0;
	
	// ここで、onlineの値に乗算するのが良さそう　falloff
	// float falloff = smoothstep(.9, 0.0, onLine);
	
	bufferColor.rgb = mix(bufferColor.rgb, finalColor, onLine);

	gl_FragColor = vec4(bufferColor.rgb,1.);


}