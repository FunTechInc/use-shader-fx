#ifdef USF_USE_MIXSRC

	usf_FragColor = mix(usf_FragColor, mixSrcColor, mixSrc_colorFactor);
	
	usf_FragColor = mix(usf_FragColor, mixSrcColor, mixSrcColor.a * mixSrc_alphaFactor);

#endif