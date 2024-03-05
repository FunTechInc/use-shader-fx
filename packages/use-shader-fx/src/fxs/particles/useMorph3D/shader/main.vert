uniform vec2 uResolution;
uniform float uMorphProgress;

// #usf <morphPositions>

varying vec3 vPosition;

void main() {


	// #usf <morphTransition>

	vec3 newPosition = usf_newPosition;
	vPosition = newPosition;

	// Final position
	vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;
	gl_Position = projectedPosition;
	
	gl_PointSize = 0.01 *  uResolution.y;
	gl_PointSize *= (1.0 / - viewPosition.z);
}