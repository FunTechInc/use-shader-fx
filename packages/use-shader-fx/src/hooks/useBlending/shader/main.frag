precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uMap;
uniform float distortionStrength;
uniform float edge0;
uniform float edge1;
uniform vec3 color;

void main() {
	vec2 uv = vUv;

	vec2 map = texture2D(uMap, uv).rg;
	vec2 normalizedMap = map * 2.0 - 1.0;
	
	uv = uv * 2.0 - 1.0;
	uv *= mix(vec2(1.0), abs(normalizedMap), distortionStrength);
	uv = (uv + 1.0) / 2.0;

	vec4 textureMap = texture2D(uTexture, uv);

	float blendValue = smoothstep(edge0, edge1, map.r);

	vec3 outputColor = blendValue * color + (1.0 - blendValue) * textureMap.rgb;

	gl_FragColor = vec4(outputColor, textureMap.a);
}