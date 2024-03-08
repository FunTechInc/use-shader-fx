uniform vec2 uResolution;
uniform float uMorphProgress;
uniform float uPointSize;

uniform sampler2D uPicture;
uniform bool uIsPicture;
uniform sampler2D uAlphaPicture;
uniform bool uIsAlphaPicture;

uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

uniform float uTime;

uniform float uWobblePositionFrequency;
uniform float uWobbleTimeFrequency;
uniform float uWobbleStrength;
uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

uniform sampler2D uDisplacement;
uniform bool uIsDisplacement;
uniform float uDisplacementIntensity;

varying vec3 vColor;
varying float vPictureAlpha;
varying vec3 vDisplacementColor;
varying float vDisplacementIntensity;

// #usf <morphPositions>
// #usf <morphUvs>
// #usf <getWobble>

void main() {
	vec3 newPosition = position;
	vec2 newUv = uv;
	// #usf <morphPositionTransition>
	// #usf <morphUvTransition>

	// ここで`newPosition`に対してdisplacement
	vec3 displacement = uIsDisplacement ? texture2D(uDisplacement, newUv).rgb : vec3(0.0);
	float displacementIntensity = smoothstep(0., 1., displacement.g);
	vDisplacementColor = displacement;
	vDisplacementIntensity = displacementIntensity;

	//この時点でdisplacementは0 ~ 1なので、それを-1~1にする
	displacement = displacement * 2.-1.;
	displacement *= displacementIntensity * uDisplacementIntensity;
	newPosition += displacement;

	// Final position
	vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	// wobble // uWobbleStrengthが0の場合はnoiseを計算しない
	float wobble = uWobbleStrength > 0. ? getWobble(projectedPosition.xyz) : 0.0;
	gl_Position = projectedPosition += wobble;
	
	// カラー　pictureがtrueの場合 はpictureをそうでない場合は、4色の線形保管
	vColor = uIsPicture ? texture2D(uPicture, newUv).rgb : mix(mix(uColor0, uColor1, newPosition.x), mix(uColor2, uColor3, newPosition.y), newPosition.z);

	// pictureのgチャンネルでAlphaを設定する
	vPictureAlpha = uIsAlphaPicture ? texture2D(uAlphaPicture, newUv).g : 1.;

	// point sizeにpicturealphaもかける。aplhamapによってサイズも調整可能に
	gl_PointSize = uPointSize * vPictureAlpha *  uResolution.y;
	gl_PointSize *= (1.0 / - viewPosition.z);
}