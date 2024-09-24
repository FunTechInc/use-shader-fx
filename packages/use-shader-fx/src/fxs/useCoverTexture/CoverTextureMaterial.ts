import * as THREE from "three";
import { fragment, vertex } from "./coverTexture.glsl";
import {
   BasicFxUniforms,
   FxBasicFxMaterial,
} from "../materials/FxBasicFxMaterial";
import { CoverTextureValues } from ".";
import { FxMaterialProps } from "../materials/FxMaterial";

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

      this.uniforms = {
         ...this.uniforms,
         ...{
            src: { value: null },
            textureResolution: { value: new THREE.Vector2() },
         },
      };

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);

      this.setupBasicFxShaders(vertex, fragment);
   }
}
