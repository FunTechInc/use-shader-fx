precision highp float;

uniform float viscosity;
uniform float forceRadius;
uniform float forceCoefficient;
uniform vec2 resolution;
uniform sampler2D dataTex;
uniform vec2 pointerPos;
uniform vec2 beforePointerPos;

#pragma glslify: map            = require('./map.glsl')
#pragma glslify: samplePressure = require('./samplePressure.glsl')

varying vec2 vUv;

void main(){
	vec2 r = resolution;
	vec2 uv = gl_FragCoord.xy / r;
	vec4 data = texture2D(dataTex, uv);
	vec2 v = data.xy;

	vec2 offsetX = vec2(1.0, 0.0);
	vec2 offsetY = vec2(0.0, 1.0);

	// 上下左右の圧力
	float pLeft   = samplePressure(dataTex, (gl_FragCoord.xy - offsetX) / r, r);
	float pRight  = samplePressure(dataTex, (gl_FragCoord.xy + offsetX) / r, r);
	float pTop    = samplePressure(dataTex, (gl_FragCoord.xy - offsetY) / r, r);
	float pBottom = samplePressure(dataTex, (gl_FragCoord.xy + offsetY) / r, r);

	//カール
	// vec2 vL = vUv - vec2(resolution.x, 0.0);
	// vec2 vR = vUv + vec2(resolution.x, 0.0);
	// vec2 vT = vUv + vec2(0.0, resolution.y);
	// vec2 vB = vUv - vec2(0.0, resolution.y);

	// float L = texture2D(dataTex, vL).y;
	// float R = texture2D(dataTex, vR).y;
	// float T = texture2D(dataTex, vT).x;
	// float B = texture2D(dataTex, vB).x;

	// float vorticity = R - L - T + B;

	// //渦巻き
	// float T = texture2D(uCurl, vT).x;
	// float B = texture2D(uCurl, vB).x;
	// float C = texture2D(dataTex, vUv).x;
	// vec2 force = vec2(abs(T) - abs(B), 0.0);
	// force *= 1.0 / length(force + 0.00001) * 28.0 * C;
	// vec2 vel = texture2D(dataTex, vUv).xy;
	// vel *= force;
	// vel *= 0.1;

	// マウス
	vec2 mPos = 0.5 * (pointerPos + 1.0) * r;
	vec2 mPPos = 0.5 * (beforePointerPos + 1.0) * r;
	vec2 mouseV = mPos - mPPos;
	float len = length(mPos - uv * r) / forceRadius;
	float d = clamp(1.0 - len, 0.0, 1.0) * length(mouseV) * forceCoefficient;
	vec2 mforce = d * normalize(mPos - uv * r + mouseV);
		
	v += vec2(pRight - pLeft, pBottom - pTop) * 0.5;
	v += mforce;
	v *= viscosity;
	// v *= vel;

	// vec2 finalColor = mix(v, vel, 0.5);

	gl_FragColor = vec4(v, data.zw);
}