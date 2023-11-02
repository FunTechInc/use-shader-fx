precision highp float;

uniform vec2 resolution;
uniform sampler2D dataTex;

varying vec2 vUv;

#pragma glslify: sampleVelocity = require('./sampleVelocity.glsl')

void main(){
	vec2 r = resolution;
	vec2 uv = gl_FragCoord.xy / r;
	vec2 offsetX = vec2(1.0, 0.0);
	vec2 offsetY = vec2(0.0, 1.0);

	// 上下左右の速度
	vec2 vLeft   = sampleVelocity(dataTex, (gl_FragCoord.xy - offsetX) / r, r);
	vec2 vRight  = sampleVelocity(dataTex, (gl_FragCoord.xy + offsetX) / r, r);
	vec2 vTop    = sampleVelocity(dataTex, (gl_FragCoord.xy - offsetY) / r, r);
	vec2 vBottom = sampleVelocity(dataTex, (gl_FragCoord.xy + offsetY) / r, r);

	float curl = (vRight.y - vLeft.y) - (vBottom.x - vTop.x);

	gl_FragColor = vec4(curl, 0.0, 0.0, 0.0);
}