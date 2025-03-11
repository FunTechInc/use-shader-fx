#ifdef USF_USE_MIXSRC
	// color
	usf_FragColor = mixSrc_color 
		? mix(usf_FragColor, mixSrcColor,
			(mixSrc_color_mixMap
				? calcMixMapPower(mixSrc_color_mixMap_src,mixSrc_color_range,mixSrc_color_mixMap_ch)
				: calcMixCirclePower(mixSrc_color_position,mixSrc_color_radius,mixSrc_color_range)) * mixSrc_color_factor) 
		: usf_FragColor;
	
	// alpha
	usf_FragColor = mixSrc_alpha 
		? mix(usf_FragColor, mixSrcColor, 
			(mixSrc_alpha_mixMap
				? calcMixMapPower(mixSrc_alpha_mixMap_src,mixSrc_alpha_range,mixSrc_alpha_mixMap_ch)
				: calcMixCirclePower(mixSrc_alpha_position,mixSrc_alpha_radius,mixSrc_alpha_range)) * mixSrc_alpha_factor * mixSrcColor.a)
		: usf_FragColor;

#endif