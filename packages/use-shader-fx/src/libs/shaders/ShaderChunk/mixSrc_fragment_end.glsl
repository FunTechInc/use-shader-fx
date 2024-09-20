#ifdef USF_USE_MIXSRC

	usf_FragColor = mix(usf_FragColor, mixSrcMap, mixSrcColor);
	
	usf_FragColor = mix(usf_FragColor, mixSrcMap, mixSrcMap.a * mixSrcAlpha);

#endif