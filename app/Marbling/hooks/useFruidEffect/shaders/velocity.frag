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
	gl_FragColor = vec4(v, data.zw);
}