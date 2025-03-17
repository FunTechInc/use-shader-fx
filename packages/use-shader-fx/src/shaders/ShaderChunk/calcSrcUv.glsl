vec2 calcSrcUv(vec2 uv, vec2 fitScale) {
	return uv * fitScale + (1.0 - fitScale) * .5;
}