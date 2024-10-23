#ifdef USF_USE_MIXDST
	float mixDstAspect = mixDst_resolution.x / mixDst_resolution.y;
	vec2 mixDstAspectAspectRatio = vec2(
		min(aspectRatio / mixDstAspect, 1.0),
		min(mixDstAspect / aspectRatio, 1.0)
	);
	vMixDstCoverUv = vUv * mixDstAspectAspectRatio + (1.0 - mixDstAspectAspectRatio) * .5;
#endif