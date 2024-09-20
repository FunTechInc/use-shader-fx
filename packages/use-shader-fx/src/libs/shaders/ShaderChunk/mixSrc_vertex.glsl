#ifdef USF_USE_MIXSRC
	float mixSrcAspect = mixSrcResolution.x / mixSrcResolution.y;
	vec2 mixSrcAspectAspectRatio = vec2(
		min(screenAspect / mixSrcAspect, 1.0),
		min(mixSrcAspect / screenAspect, 1.0)
	);
	vMixSrcCoverUv = vUv * mixSrcAspectAspectRatio + (1.0 - mixSrcAspectAspectRatio) * .5;
#endif