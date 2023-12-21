precision highp float;
varying vec2 vUv;

uniform sampler2D uTexture;
uniform bool isTexture;
uniform float laminateLayer;
uniform vec2 laminateInterval;
uniform vec2 laminateDetail;
uniform vec2 distortion;
uniform vec3 colorFactor;

void main() {
	vec2 uv = vUv;
	vec2 p = isTexture ? texture2D(uTexture, uv).rg : uv;
	float alpha = isTexture ? texture2D(uTexture, uv).a : 1.0;
	vec3 col;
	for(float j = 0.0; j < 3.0; j++){		
		for(float i = 1.0; i < laminateLayer; i++){
			p.x += laminateInterval.x / (i + j) * cos(i * distortion.x * p.y + sin(i + j));
			p.y += laminateInterval.y / (i + j) * cos(i * distortion.y * p.x + sin(i + j));
		}
		col[int(j)] = fract(p.x * laminateDetail.x + p.y * laminateDetail.y);
	}
	col *= colorFactor;
	col = clamp(col, 0.0, 1.0);
	gl_FragColor = vec4(col, alpha);
}