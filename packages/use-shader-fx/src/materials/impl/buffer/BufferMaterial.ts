import {
   SamplingFxUniforms,
   SamplingFxValues,
   SamplingFxMaterial,
} from "../../core/SamplingFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import {
   ExtractUniformValues,
   NestUniformValues,
} from "../../../shaders/uniformsUtils";
import { ShaderLib } from "../../../shaders/ShaderLib";

type BufferUniforms = SamplingFxUniforms;

export type BufferValues = NestUniformValues<BufferUniforms> & SamplingFxValues;

export type BufferMaterialProps = ExtractUniformValues<BufferUniforms>;

export class BufferMaterial extends SamplingFxMaterial {
   static get type() {
      return "BufferMaterial";
   }

   uniforms!: BufferUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<BufferValues>) {
      super({
         vertexShader: `
				void main() {
					${ShaderLib.plane_vertex}
				}
			`,
         fragmentShader: `
			
				void main() {
					vec2 usf_Uv = vTextureCoverUv;

					${ShaderLib.basicFx_fragment_begin}

					vec4 usf_FragColor = fitTexture(texture_src,usf_Uv);

					${ShaderLib.basicFx_fragment_end}

					gl_FragColor = usf_FragColor;

				}
			`,
         uniformValues,
         materialParameters,
      });

      this.type = BufferMaterial.type;
   }
}
