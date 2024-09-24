#ifdef USF_USE_MIXDST

	vec4 mixDstColor = texture2D(mixDst, mix(vMixDstCoverUv,usf_FragColor.rg,mixDstUvFactor));

	usf_FragColor = mix(usf_FragColor, mixDstColor, mixDstColorFactor);

	usf_FragColor = mix(usf_FragColor, mixDstColor, mixDstColor.a * mixDstAlphaFactor);
	
#endif