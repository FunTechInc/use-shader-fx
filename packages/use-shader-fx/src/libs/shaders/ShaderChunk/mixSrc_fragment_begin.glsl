#ifdef USF_USE_MIXSRC

	vec4 mixSrcMap = texture2D(mixSrc, vMixSrcCoverUv);
	usf_Uv = mix(usf_Uv, mixSrcMap.rg, mixSrcUv);

#endif