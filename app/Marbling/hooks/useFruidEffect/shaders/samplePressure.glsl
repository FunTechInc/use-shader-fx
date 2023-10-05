float samplePressure(sampler2D tex, vec2 uv, vec2 resolution){
	vec2 cellOffset = vec2(0.0, 0.0);

	//pure Neumann boundary conditions: 0 pressure gradient across the boundary
	//dP/dx = 0
	//walls
	if(uv.x < 0.0) {
		cellOffset.x = 1.0;

	} else if(uv.x > 1.0) {
		cellOffset.x = -1.0;

	}

	if(uv.y < 0.0) {
		cellOffset.y = 1.0;

	} else if(uv.y > 1.0) {
		cellOffset.y = -1.0;

	}

	return texture2D(tex, uv + cellOffset / resolution).z;
}

#pragma glslify: export(samplePressure)