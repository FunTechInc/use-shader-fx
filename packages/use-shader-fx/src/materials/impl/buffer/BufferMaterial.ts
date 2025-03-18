import * as THREE from "three";
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

/*===============================================
memo

- BufferMaterialはMaterialをそのまま、r3fでextendしてコンポーネントとして使うケースが考えられる
ので、keyを持たせる
- また、globalで型定義する
===============================================*/

type BufferUniforms = SamplingFxUniforms;

export type BufferValues = NestUniformValues<BufferUniforms> & SamplingFxValues;

export type BufferMaterialProps = ExtractUniformValues<BufferUniforms>;

export class BufferMaterial extends SamplingFxMaterial {
   public static readonly key: string = THREE.MathUtils.generateUUID();

   static get type() {
      return "BufferMaterial";
   }

   uniforms!: BufferUniforms;

   constructor(props: FxMaterialProps<BufferValues> = {}) {
      super({
         ...props,
         vertexShader: `
				void main() {
					${ShaderLib.plane_vertex}
				}
			`,
         fragmentShader: `
				void main() {
					vec2 usf_Uv = vTextureCoverUv;

					${ShaderLib.basicFx_fragment_begin}

					vec4 usf_FragColor = fitTexture(texture_src,usf_Uv,texture_fit);

					${ShaderLib.basicFx_fragment_end}

					gl_FragColor = usf_FragColor;
				}
			`,
      });

      this.type = BufferMaterial.type;
   }
}

declare global {
   namespace JSX {
      interface IntrinsicElements {
         bufferMaterial: BufferMaterialProps & {
            ref?: React.RefObject<BufferMaterial>;
            key?: React.Key;
         };
      }
   }
}
