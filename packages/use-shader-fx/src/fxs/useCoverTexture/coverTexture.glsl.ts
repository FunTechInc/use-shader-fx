import { ShaderLib } from "../../libs/shaders/ShdaerLib";

export const vertex = `
	${ShaderLib.basicFx_pars_vertex}

	uniform vec2 textureResolution;
	varying vec2 vCoverTextureUv;

	void main() {
		${ShaderLib.basicFx_vertex}

		float textureAspect = textureResolution.x / textureResolution.y;
		vec2 aspectRatio = vec2(
			min(screenAspect / textureAspect, 1.0),
			min(textureAspect / screenAspect, 1.0)
		);
		vCoverTextureUv = vUv * aspectRatio + (1.0 - aspectRatio) * .5;

		gl_Position = vec4(position, 1.0);
	}
`;

export const fragment = `
	${ShaderLib.basicFx_pars_fragment}

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
