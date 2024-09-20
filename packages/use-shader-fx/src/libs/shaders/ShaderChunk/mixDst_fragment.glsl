#ifdef USF_USE_MIXDST

	vec4 mixDstMap = texture2D(mixDst, mix(vMixDstCoverUv,usf_FragColor.rg,mixDstUv));

	usf_FragColor = mix(usf_FragColor, mixDstMap, mixDstColor);

	usf_FragColor = mix(usf_FragColor, mixDstMap, mixDstMap.a * mixDstAlpha);
	
#endif