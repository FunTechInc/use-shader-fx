import { ShaderLib } from "../../../libs/shaders/ShaderLib";

export const vertex = `
	uniform vec2 textureResolution;
	varying vec2 vCoverTextureUv;

	void main() {
		float textureAspect = textureResolution.x / textureResolution.y;
		vec2 aspectRatio = vec2(
			min(aspectRatio / textureAspect, 1.0),
			min(textureAspect / aspectRatio, 1.0)
		);
		vCoverTextureUv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;

		${ShaderLib.plane_vertex}
	}
`;

export const fragment = `
	uniform sampler2D src;
	varying vec2 vCoverTextureUv;

	void main() {

		vec2 usf_Uv = vCoverTextureUv;
		${ShaderLib.basicFx_fragment_begin}
			
		vec4 texColor = texture2D(src, usf_Uv);

		vec4 usf_FragColor = texColor;

		${ShaderLib.basicFx_fragment_end}
				
		gl_FragColor = usf_FragColor;
	}
`;
