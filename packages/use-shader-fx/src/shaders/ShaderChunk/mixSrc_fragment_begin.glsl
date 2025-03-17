#ifdef USF_USE_MIXSRC

	vec4 mixSrcColor = fitTexture(mixSrc_src, vMixSrcCoverUv, mixSrc_fit);

	usf_Uv += mixSrc_uv 
		? (mixSrc_uv_offset + (vec2(mixSrcColor[mixSrc_uv_ch]) * 2. - 1.)) * 
			(mixSrc_uv_mixMap 
				? calcMixMapPower(mixSrc_uv_mixMap_src,mixSrc_uv_range,mixSrc_uv_mixMap_ch)
				: calcMixCirclePower(mixSrc_uv_position,mixSrc_uv_radius,mixSrc_uv_range)) * mixSrc_uv_factor
		: vec2(0.);

#endif