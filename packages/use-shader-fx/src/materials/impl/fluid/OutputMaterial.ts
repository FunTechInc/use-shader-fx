import * as THREE from "three";
import { FxMaterialProps } from "../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../core/BasicFxLib";
import { BasicFxMaterial } from "../../core/BasicFxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { ShaderLib } from "../../../shaders/ShaderLib";

type OutputUniforms = {
   src: { value: THREE.Texture };
} & BasicFxUniforms;

export type OutputValues = NestUniformValues<OutputUniforms> & BasicFxValues;

export class OutputMaterial extends BasicFxMaterial {
   static get type() {
      return "OutputMaterial";
   }

   uniforms!: OutputUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<OutputValues> = {}) {
      super({
         uniformValues,
         materialParameters,
         vertexShader: `
				void main() {
					${ShaderLib.plane_vertex}
				}
			`,
         fragmentShader: `
				uniform sampler2D src;
				void main() {
					vec2 usf_Uv = vUv;
					
					${ShaderLib.basicFx_fragment_begin}

					vec4 usf_FragColor = vec4(length(texture2D(src,usf_Uv).rg));
					
					${ShaderLib.basicFx_fragment_end}

					gl_FragColor = usf_FragColor;
				}
			`,
         uniforms: {
            src: { value: DEFAULT_TEXTURE },
         },
      });
      this.type = OutputMaterial.type;
   }
}
