#ifdef USF_USE_MIXSRC

	vec4 mixSrcColor = texture2D(mixSrc, vMixSrcCoverUv);
	usf_Uv = mix(usf_Uv, mixSrcColor.rg, mixSrcUvFactor);

#endif