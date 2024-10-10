import * as THREE from "three";
import { fragment, vertex } from "./coverTexture.glsl";
import { FxBasicFxMaterial } from "../../materials/core/FxBasicFxMaterial";
import { CoverTextureValues } from ".";
import { FxMaterialProps } from "../../materials/core/FxMaterial";
import { BasicFxUniforms } from "../../materials/core/BasicFxLib";

type CoverTextureUniforms = {
   src: { value: THREE.Texture | null };
   textureResolution: { value: THREE.Vector2 };
} & BasicFxUniforms;

export class CoverTextureMaterial extends FxBasicFxMaterial {
   static get type() {
      return "NoiseMaterial";
   }

   uniforms!: CoverTextureUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<CoverTextureValues>) {
      super();

      this.type = CoverTextureMaterial.type;

      this.uniforms = THREE.UniformsUtils.merge([
         this.uniforms,
         {
            src: { value: null },
            textureResolution: { value: new THREE.Vector2() },
         },
      ]) as CoverTextureUniforms;

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);

      this.setupBasicFxShaders(vertex, fragment);
   }
}
