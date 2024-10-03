import * as THREE from "three";
import { FxMaterialProps, ShaderWithUniforms } from "./FxMaterial";
import { ShaderLib } from "../libs/shaders/ShaderLib";
import { FxBasicFxMaterial } from "./FxBasicFxMaterial";
import { BasicFxUniforms, BasicFxValues } from "./BasicFxLib";

type FxBasicFxMaterialImplUniforms = {
   src: { value: THREE.Texture };
} & BasicFxUniforms;

export type FxBasicFxMaterialImplValues = {
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

export const createFxBasicFxMaterialImpl = ({
   uniforms,
   vertexShader = vertex,
   fragmentShader = fragment,
}: ShaderWithUniforms = {}) => {
   class FxBasicFxMaterialImpl extends FxBasicFxMaterial {
      public key: string = THREE.MathUtils.generateUUID();

      static get type() {
         return "FxBasicFxMaterialImpl";
      }

      uniforms!: FxBasicFxMaterialImplUniforms;

      constructor(props: FxMaterialProps<FxBasicFxMaterialImplValues>) {
         super();

         this.type = FxBasicFxMaterialImpl.type;

         this.uniforms = THREE.UniformsUtils.merge([
            this.uniforms,
            {
               src: { value: null },
            },
            uniforms || {},
            props?.uniforms || {},
         ]) as FxBasicFxMaterialImplUniforms;

         this.setupBasicFxShaders(
            props?.vertexShader || vertexShader,
            props?.fragmentShader || fragmentShader
         );

         this.setUniformValues(props?.uniformValues);
         this.setValues(props?.materialParameters || {});

         // to update basicFx flag
         this.defineUniformAccessors(this.updateBasicFx.bind(this));
      }
   }

   return FxBasicFxMaterialImpl as typeof FxBasicFxMaterialImpl & {
      key: string;
   };
};
