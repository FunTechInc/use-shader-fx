#ifdef USF_USE_MIXDST

	// uv
	vec2 mixedUv = vMixDstCoverUv;
	mixedUv += mixDst_uv 
		? (mixDst_uv_offset + (vec2(usf_FragColor[mixDst_uv_ch]) * 2. - 1.)) * 
			(mixDst_uv_mixMap 
				? calcMixMapPower(mixDst_uv_mixMap_src,mixDst_uv_range,mixDst_uv_mixMap_ch)
				: calcMixCirclePower(mixDst_uv_position,mixDst_uv_radius,mixDst_uv_range)) * mixDst_uv_factor
		: vec2(0.);
	vec4 mixDstColor = fitTexture(mixDst_src, mixedUv);

	// color
	usf_FragColor = mixDst_color 
		? mix(usf_FragColor, mixDstColor,
			(mixDst_color_mixMap
				? calcMixMapPower(mixDst_color_mixMap_src,mixDst_color_range,mixDst_color_mixMap_ch)
				: calcMixCirclePower(mixDst_color_position,mixDst_color_radius,mixDst_color_range)) * mixDst_color_factor) 
		: usf_FragColor;

	// alpha
	usf_FragColor = mixDst_alpha 
		? mix(usf_FragColor, mixDstColor, 
			(mixDst_alpha_mixMap
				? calcMixMapPower(mixDst_alpha_mixMap_src,mixDst_alpha_range,mixDst_alpha_mixMap_ch)
				: calcMixCirclePower(mixDst_alpha_position,mixDst_alpha_radius,mixDst_alpha_range)) * mixDst_alpha_factor * mixDstColor.a)
		: usf_FragColor;

#endif

