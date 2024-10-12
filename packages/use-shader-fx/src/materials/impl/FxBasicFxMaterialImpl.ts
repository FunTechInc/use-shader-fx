import * as THREE from "three";
import { FxMaterialProps, ShaderWithUniforms } from "../core/FxMaterial";
import { ShaderLib } from "../../libs/shaders/ShaderLib";
import { FxBasicFxMaterial } from "../core/FxBasicFxMaterial";
import {
   BasicFxUniforms,
   BasicFxValues,
   ExtractUniformValue,
} from "../core/BasicFxLib";

type FxBasicFxMaterialImplUniforms = {
   src: { value: THREE.Texture };
} & BasicFxUniforms;

export type FxBasicFxMaterialImplValues =
   ExtractUniformValue<FxBasicFxMaterialImplUniforms> & BasicFxValues;

const DEFAULT_VERTEX = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

const DEFAULT_FRAGMENT = `
	uniform sampler2D src;
	void main() {

		vec2 usf_Uv = vUv;

		${ShaderLib.basicFx_fragment_begin}

		vec4 usf_FragColor = texture2D(src, usf_Uv);

		${ShaderLib.basicFx_fragment_end}

		gl_FragColor = usf_FragColor;

	}
`;

export const createFxBasicFxMaterialImpl = ({
   uniforms,
   vertexShader = DEFAULT_VERTEX,
   fragmentShader = DEFAULT_FRAGMENT,
}: ShaderWithUniforms = {}) => {
   class FxBasicFxMaterialImpl extends FxBasicFxMaterial {
      public static readonly key: string = THREE.MathUtils.generateUUID();

      static get type() {
         return "FxBasicFxMaterialImpl";
      }

      uniforms!: FxBasicFxMaterialImplUniforms;

      constructor(props: FxMaterialProps<FxBasicFxMaterialImplValues>) {
         super({
            vertexShader: props?.vertexShader || vertexShader,
            fragmentShader: props?.fragmentShader || fragmentShader,
            uniformValues: props?.uniformValues,
            materialParameters: props?.materialParameters,
            uniforms: THREE.UniformsUtils.merge([
               {
                  src: { value: null },
               },
               uniforms || {},
               props?.uniforms || {},
            ]),
         });

         this.type = FxBasicFxMaterialImpl.type;
      }
   }

   return FxBasicFxMaterialImpl as typeof FxBasicFxMaterialImpl & {
      key: string;
   };
};
