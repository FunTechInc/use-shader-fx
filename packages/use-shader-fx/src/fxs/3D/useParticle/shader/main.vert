uniform vec2 uResolution;
uniform float uMorphProgress;
uniform float uTime;

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
	
	gl_PointSize = 0.01 *  uResolution.y; // TODO : 画面高に応じてサイズを変えるでいい？
	gl_PointSize *= (1.0 / - viewPosition.z);
}





// uniform vec2 uResolution;
// // uniform float uGeometryAspect;
// uniform sampler2D uPicture;
// // uniform vec2 uPictureResolution;
// uniform sampler2D uDisplacement;

// varying vec4 vColor;

// void main() {

// 	vec3 newPosition = position;
    
// 	float displacementIntensity = texture(uDisplacement, uv).r;
// 	displacementIntensity = smoothstep(0.1, 0.3, displacementIntensity);
   
// 	// TODO : displacementのattribute
// 	vec3 displacement = vec3(
// 		0.,
// 		0.,
// 		1.
// 	);

// 	displacement = normalize(displacement);
// 	displacement *= displacementIntensity;

// 	// TODO * intensityのattributeとか
//    //  displacement *= aIntensity;
    
// 	newPosition += displacement;
		
// 	// newPosition. += 10.5;
	
// 	// Final position
// 	vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
// 	vec4 viewPosition = viewMatrix * modelPosition;
// 	vec4 projectedPosition = projectionMatrix * viewPosition;
// 	gl_Position = projectedPosition;

// 	// Picture
// 	// float screenAspect = uGeometryAspect;
// 	// float pictureAspect = uPictureResolution.x / uPictureResolution.y;
// 	// vec2 aspectRatio = vec2(
// 	// 	min(screenAspect / pictureAspect, 1.0),
// 	// 	min(pictureAspect / screenAspect, 1.0)
// 	// );
// 	// vec2 picUv = uv * aspectRatio + (1.0 - aspectRatio) * .5;
// 	vec4 pictureColor = texture(uPicture, uv);
	
// 	// Point size // TODO: r chに応じてサイズを変える、このinstensityもuniformにする
// 	// float pictureIntensity = pictureColor.r;
// 	float pictureIntensity = 1.0;
// 	gl_PointSize = 0.2 * pictureIntensity *  uResolution.y; // TODO : 画面高に応じてサイズを変えるでいい？
// 	gl_PointSize *= (1.0 / - viewPosition.z);

// 	// Varyings
// 	vColor = pictureColor;
// }