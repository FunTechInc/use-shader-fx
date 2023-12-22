precision highp float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform sampler2D u_map;
uniform float u_mapIntensity;

void main() {
	vec2 uv = vUv;

	vec2 mapColor = texture2D(u_map, uv).rg;
	vec2 normalizedMap = mapColor * 2.0 - 1.0;
	
	uv = uv * 2.0 - 1.0;
	uv *= mix(vec2(1.0), abs(normalizedMap.rg), u_mapIntensity);
	uv = (uv + 1.0) / 2.0;

	gl_FragColor = texture2D(u_texture, uv);
}