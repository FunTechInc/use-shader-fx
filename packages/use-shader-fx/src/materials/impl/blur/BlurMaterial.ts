import * as THREE from "three";
import { fragment, vertex } from "./blur.glsl";
import { FxBasicFxMaterial } from "../../core/FxBasicFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import {
   BasicFxUniforms,
   BasicFxValues,
   ExtractUniformValue,
} from "../../core/BasicFxLib";

type BlurUniforms = {
   /**  */
   src: { value: THREE.Texture | null };
   /**  */
   blurSize: { value: number };
} & BasicFxUniforms;

export type BlurValues = ExtractUniformValue<BlurUniforms> & BasicFxValues;

export class BlurMaterial extends FxBasicFxMaterial {
   static get type() {
      return "BlurMaterial";
   }

   uniforms!: BlurUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<BlurValues>) {
      super({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            src: { value: null },
            blurSize: { value: 5 },
         } as BlurUniforms,
      });

      this.type = BlurMaterial.type;
   }
}
