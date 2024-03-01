varying vec2 vUv;
uniform float uMorphProgress;
uniform int uMorphLength;
uniform float uTime;

// #include <morphAttibutes>

varying vec3 vPosition;

void main() {
	vUv = uv;
	gl_PointSize = 4.0;
	vec3 pos = position;

	// #include <morphAttibutesList>
	

	if(uMorphLength >= 1) {		
		int baseIndex = int(floor(uMorphProgress));		
		baseIndex = clamp(baseIndex, 0, uMorphLength - 1); // clamp to between 0 and (length - 1)		
		float progress = fract(uMorphProgress);
		int nextIndex = baseIndex + 1;
		pos = mix(attibutesList[baseIndex], attibutesList[nextIndex], progress);
	}

	vPosition = pos;
	gl_Position = vec4(pos, 1.0);
}