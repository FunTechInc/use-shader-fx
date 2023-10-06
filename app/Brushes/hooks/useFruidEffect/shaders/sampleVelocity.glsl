vec2 sampleVelocity(sampler2D tex, vec2 uv, vec2 resolution){
	vec2 cellOffset = vec2(0.0, 0.0);
	vec2 multiplier = vec2(1.0, 1.0);

	//free-slip boundary: the average flow across the boundary is restricted to 0
	//avg(uA.xy, uB.xy) dot (boundary normal).xy = 0
	//walls
	if(uv.x < 0.0) {
		cellOffset.x = 1.0;
		multiplier.x = -1.0;

	} else if(uv.x > 1.0) {
		cellOffset.x = -1.0;
		multiplier.x = -1.0;
	}

	if(uv.y < 0.0) {
		cellOffset.y = 1.0;
		multiplier.y = -1.0;

	} else if(uv.y > 1.0) {
		cellOffset.y = -1.0;
		multiplier.y = -1.0;
	}

  return multiplier * texture2D(tex, uv + cellOffset / resolution).xy;
}

#pragma glslify: export(sampleVelocity)