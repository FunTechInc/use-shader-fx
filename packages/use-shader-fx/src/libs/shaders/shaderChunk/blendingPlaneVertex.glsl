precision highp float;

varying vec2 vUv;
varying vec2 vCoverUv;

uniform vec2 resolution;
uniform vec2 fxBlendingSrcResolution;

void main() {
	vUv = uv;

	float screenAspect = resolution.x / resolution.y;
	float blendingSrcAspect = fxBlendingSrcResolution.x / fxBlendingSrcResolution.y;
	vec2 aspectRatio = vec2(
		min(screenAspect / blendingSrcAspect, 1.0),
		min(blendingSrcAspect / screenAspect, 1.0)
	);
	vCoverUv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;

	gl_Position = vec4(position, 1.0);
}