precision highp float;

uniform float alpha;
uniform float beta;
uniform vec2 resolution;
uniform sampler2D dataTex;

#pragma glslify: samplePressure = require('./samplePressure.glsl')

void main(){
	vec2 r = resolution;
	vec4 data = texture2D(dataTex, gl_FragCoord.xy / r);

	// 上下左右の圧力
	float pLeft   = samplePressure(dataTex, (gl_FragCoord.xy - vec2(1.0, 0.0)) / r, r);
	float pRight  = samplePressure(dataTex, (gl_FragCoord.xy + vec2(1.0, 0.0)) / r, r);
	float pTop    = samplePressure(dataTex, (gl_FragCoord.xy - vec2(0.0, 1.0)) / r, r);
	float pBottom = samplePressure(dataTex, (gl_FragCoord.xy + vec2(0.0, 1.0)) / r, r);

	float divergence = data.w;
	float pressure = (divergence * alpha + (pLeft + pRight + pTop + pBottom)) * 0.25 * beta;
	gl_FragColor = vec4(data.xy, pressure, divergence);
}