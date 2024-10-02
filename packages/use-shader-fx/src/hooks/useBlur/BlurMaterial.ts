import * as THREE from "three";
import { fragment, vertex } from "./blur.glsl";
import { FxBasicFxMaterial } from "../../materials/FxBasicFxMaterial";
import { BlurValues } from ".";
import { FxMaterialProps } from "../../materials/FxMaterial";
import { BasicFxUniforms } from "../../materials/BasicFxLib";

type BlurUniforms = {
   src: { value: THREE.Texture | null };
   blurSize: { value: number };
} & BasicFxUniforms;

export class BlurMaterial extends FxBasicFxMaterial {
   static get type() {
      return "BlurMaterial";
   }

   uniforms!: BlurUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<BlurValues>) {
      super();

      this.type = BlurMaterial.type;

      this.uniforms = {
         ...this.uniforms,
         ...{
            src: { value: null },
            blurSize: { value: 5 },
         },
      };

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);

      this.setupBasicFxShaders(vertex, fragment);
   }
}
