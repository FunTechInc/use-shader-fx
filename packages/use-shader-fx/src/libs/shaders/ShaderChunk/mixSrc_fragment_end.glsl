#ifdef USF_USE_MIXSRC

	usf_FragColor = mix(usf_FragColor, mixSrcColor, mixSrcColorFactor);
	
	usf_FragColor = mix(usf_FragColor, mixSrcColor, mixSrcColor.a * mixSrcAlphaFactor);

#endif