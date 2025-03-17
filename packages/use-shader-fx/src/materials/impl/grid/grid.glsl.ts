import { ShaderLib } from "../../../shaders/ShaderLib";

export const gridVertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const gridFragment = `
	uniform vec2 count;
	uniform bool autoScale;
	uniform float tick;
	uniform bool shuffle;
	uniform float shuffle_frequency;
	uniform float shuffle_range;

	uniform bool sprite;
	uniform sampler2D sprite_src;
	uniform float sprite_length;
	uniform float sprite_shuffleSpeed;

	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
	}

	vec2 shuffleIndex(vec2 cellIndex , vec2 count) {

		float discreteTime = floor(tick * shuffle_frequency);

		float r1 = hash(cellIndex + vec2(0.123, discreteTime));
		float r2 = hash(cellIndex + vec2(0.789, discreteTime));

		// -range ~ +range
		float offsetX = floor(r1 * (shuffle_range * 2.0 + 1.0)) - shuffle_range;
		float offsetY = floor(r2 * (shuffle_range * 2.0 + 1.0)) - shuffle_range;
		vec2 offset = vec2(offsetX, offsetY);

		return mod(cellIndex + offset, count);
	}

	void main() {
		vec2 usf_Uv = vUv;
		${ShaderLib.basicFx_fragment_begin}

		vec2 n_count = count;
		n_count.x *= autoScale ? aspectRatio : 1.;

		vec2 cellIndex = ceil(usf_Uv * n_count);

		vec2 shuffledIndex = shuffle ? shuffleIndex(cellIndex, n_count) : cellIndex;

		vec2 cellCenter = calcSrcUv((shuffledIndex - .5) / n_count, texture_fitScale);

		vec4 gridTextureColor = fitTexture(texture_src, cellCenter, texture_fit);

		if(sprite){
			vec2 cellUv = fract(usf_Uv * n_count);
			float cellHash = hash(cellIndex);
			float spritePos = fract(cellHash + tick * sprite_shuffleSpeed);
			float spriteIndex = floor(spritePos * sprite_length);
			float spriteSize = 1.0 / sprite_length;
			float spriteOffset = spriteIndex * spriteSize;
			float spriteU = spriteOffset + cellUv.x * spriteSize;
			vec2 spriteUv = vec2(spriteU, cellUv.y);
			vec4 spriteColor = texture2D(sprite_src, spriteUv);
			gridTextureColor *= spriteColor;
		}

		vec4 usf_FragColor = gridTextureColor;
		${ShaderLib.basicFx_fragment_end}

		gl_FragColor = usf_FragColor;

	}
`;
