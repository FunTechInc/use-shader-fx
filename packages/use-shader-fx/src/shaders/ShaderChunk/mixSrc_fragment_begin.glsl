#ifdef USF_USE_MIXSRC

	vec4 mixSrcColor = texture2D(mixSrc_src, vMixSrcCoverUv);
	usf_Uv = mix(usf_Uv, mixSrcColor.rg, mixSrc_uvFactor);

#endif