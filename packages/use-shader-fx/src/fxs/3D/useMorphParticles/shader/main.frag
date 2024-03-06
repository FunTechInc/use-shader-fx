precision highp float;
precision highp int;

varying vec3 vPosition;
varying vec3 vColor;
varying float vPictureAlpha;

uniform float uBlurAlpha;
uniform float uBlurRadius;
uniform sampler2D uMap;
uniform bool uIsMap;
uniform sampler2D uAlphaMap;
uniform bool uIsAlphaMap;

void main() {    
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
    
	// 円にする
	float distanceToCenter = length(uv - .5);
	float alpha = clamp(uBlurRadius / distanceToCenter - (1.-uBlurAlpha) , 0. , 1.);

	// mapがある場合はmapする
	vec3 finalColor = uIsMap ? texture2D(uMap,uv).rgb : vColor;

	// alpha mapを取得する
	float alphaMap = uIsAlphaMap ? texture2D(uAlphaMap,uv).g : 1.;

	gl_FragColor = vec4(finalColor,alpha * vPictureAlpha * alphaMap);
}
