import * as THREE from "three";
import {
   DefaultUniforms,
   FxMaterial,
   FxMaterialProps,
   ShaderWithUniforms,
} from "../core/FxMaterial";
import { ShaderLib } from "../../libs/shaders/ShaderLib";
import { DEFAULT_TEXTURE } from "../../libs/constants";
import { ExtractUniformValue } from "../core/BasicFxLib";

type FxMaterialImplUniforms = {
   src: { value: THREE.Texture };
} & DefaultUniforms;

export type FxMaterialImplValues = ExtractUniformValue<FxMaterialImplUniforms>;

const DEFAULT_VERTEX = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

const DEFAULT_FRAGMENT = `
	uniform sampler2D src;
	void main() {
		gl_FragColor = texture2D(src, vUv);
	}
`;

export const createFxMaterialImpl = ({
   uniforms,
   vertexShader = DEFAULT_VERTEX,
   fragmentShader = DEFAULT_FRAGMENT,
}: ShaderWithUniforms = {}) => {
   class FxMaterialImpl extends FxMaterial {
      public static readonly key: string = THREE.MathUtils.generateUUID();

      static get type() {
         return "FxMaterialImpl";
      }

      uniforms!: FxMaterialImplUniforms;

      constructor(props: FxMaterialProps<FxMaterialImplValues>) {
         super({
            vertexShader: props?.vertexShader || vertexShader,
            fragmentShader: props?.fragmentShader || fragmentShader,
            uniformValues: props?.uniformValues,
            materialParameters: props?.materialParameters,
            uniforms: THREE.UniformsUtils.merge([
               {
                  src: { value: DEFAULT_TEXTURE },
               },
               uniforms || {},
               props?.uniforms || {},
            ]),
         });

         this.type = FxMaterialImpl.type;
      }
   }

   return FxMaterialImpl as typeof FxMaterialImpl & {
      key: string;
   };
};
