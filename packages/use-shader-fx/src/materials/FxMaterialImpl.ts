import * as THREE from "three";
import {
   DefaultUniforms,
   FxMaterial,
   FxMaterialProps,
   ShaderWithUniforms,
   Uniforms,
} from "./FxMaterial";
import { ShaderLib } from "../libs/shaders/ShaderLib";
import { DEFAULT_TEXTURE } from "../libs/constants";

type FxMaterialImplUniforms = {
   src: { value: THREE.Texture };
} & DefaultUniforms;

type FxMaterialImplValues = {
   src?: THREE.Texture;
};

const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

const fragment = `
	uniform sampler2D src;
	void main() {
		gl_FragColor = texture2D(src, vUv);
	}
`;

export const createFxMaterial = ({
   uniforms,
   vertexShader = vertex,
   fragmentShader = fragment,
}: ShaderWithUniforms = {}) => {
   class FxMaterialImpl extends FxMaterial {
      static get type() {
         return "FxMaterialImpl";
      }

      uniforms!: FxMaterialImplUniforms & Uniforms;

      constructor(props: FxMaterialProps<FxMaterialImplValues>) {
         super();

         this.type = FxMaterialImpl.type;

         this.uniforms = {
            ...this.uniforms,
            ...{
               src: { value: DEFAULT_TEXTURE },
            },
            ...uniforms,
            ...props?.uniforms,
         };

         this.setupDefaultShaders(
            props?.vertexShader || vertexShader,
            props?.fragmentShader || fragmentShader
         );

         this.setUniformValues(props?.uniformValues);
         this.setValues(props?.materialParameters || {});

         this.defineUniformAccessors();
      }
   }

   return FxMaterialImpl;
};
