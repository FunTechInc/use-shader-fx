import * as THREE from "three";
import {
   DefaultUniforms,
   FxMaterial,
   FxMaterialProps,
   ShaderWithUniforms,
} from "./FxMaterial";
import { ShaderLib } from "../libs/shaders/ShaderLib";
import { DEFAULT_TEXTURE } from "../libs/constants";
import { FxBasicFxMaterial } from "./FxBasicFxMaterial";
import { BasicFxUniforms, BasicFxValues } from "./BasicFxLib";

type FxBasicFxMaterialImplUniforms = {
   src: { value: THREE.Texture };
} & BasicFxUniforms;

type FxBasixFxMaterialImplValues = {
   src?: THREE.Texture;
} & BasicFxValues;

const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

const fragment = `
	uniform sampler2D src;
	void main() {

		vec2 usf_Uv = vUv;

		${ShaderLib.basicFx_fragment_begin}

		vec4 usf_FragColor = texture2D(src, usf_Uv);

		${ShaderLib.basicFx_fragment_end}

		gl_FragColor = usf_FragColor;

	}
`;

/*===============================================
TODO *
- FxMaterialImplもTHREE.UniformsUtils.mergeを使うように変更
	- そもそもなぜ、mergeを使うとバグが解消されるのか調査
- 全体的に、THREE.UniformsUtils.mergeの必要性を検討

===============================================*/
export const createFxBasixFxMaterial = ({
   uniforms,
   vertexShader = vertex,
   fragmentShader = fragment,
}: ShaderWithUniforms = {}) => {
   class FxBasicFxMaterialImpl extends FxBasicFxMaterial {
      static get type() {
         return "FxBasicFxMaterialImpl";
      }

      uniforms!: FxBasicFxMaterialImplUniforms;

      constructor(props: FxMaterialProps<FxBasixFxMaterialImplValues>) {
         super();

         this.type = FxBasicFxMaterialImpl.type;

         this.uniforms = {
            ...THREE.UniformsUtils.merge([
               this.uniforms,
               {
                  src: { value: null },
               },
            ]),
            ...uniforms,
            ...props?.uniforms,
         };

         this.setupBasicFxShaders(
            props?.vertexShader || vertexShader,
            props?.fragmentShader || fragmentShader
         );

         this.setUniformValues(props?.uniformValues);
         this.setValues(props?.materialParameters || {});

         this.defineUniformAccessors(() => this.updateBasicFx());
      }
   }

   return FxBasicFxMaterialImpl;
};
