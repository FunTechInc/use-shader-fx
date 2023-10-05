float map(float value, float inputMin, float inputMax, float outputMin, float outputMax, bool clamp) {
	if(clamp == true) {
		if(value < inputMin) return outputMin;
		if(value > inputMax) return outputMax;
	}

	float p = (outputMax - outputMin) / (inputMax - inputMin);
	return ((value - inputMin) * p) + outputMin;
}
#pragma glslify: export(map)