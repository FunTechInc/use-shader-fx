#ifdef USF_USE_SRC_SYSTEM

	float calcMixCirclePower(vec2 center, float radius, vec2 range)
	{
		vec2 adjustedUV = (vUv - 0.5) * vec2(aspectRatio, 1.0) + 0.5;
		vec2 adjustedCenter = (center - 0.5) * vec2(aspectRatio, 1.0) + 0.5;
		
		float dist = length(adjustedUV - adjustedCenter);
		float power = radius > 0.0 ? 1.0 - dist / radius : 1.0;
		return smoothstep(range.x,range.y,power);
	}

	float calcMixMapPower(sampler2D map,vec2 range, int ch)
	{
		return smoothstep(range.x,range.y, texture2D(map, vUv)[ch]);
	}

	vec4 fitTexture(sampler2D src , vec2 uv)
	{
		return mix(vec4(0.), texture2D(src, uv), step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0));
	}

#endif