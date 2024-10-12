import * as THREE from "three";
import { fragment, vertex } from "./coverTexture.glsl";
import { FxBasicFxMaterial } from "../../core/FxBasicFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import {
   BasicFxUniforms,
   BasicFxValues,
   ExtractUniformValue,
} from "../../core/BasicFxLib";

type CoverTextureUniforms = {
   /**  */
   src: { value: THREE.Texture | null };
   /**  */
   textureResolution: { value: THREE.Vector2 };
} & BasicFxUniforms;

export type CoverTextureValues = ExtractUniformValue<CoverTextureUniforms> &
   BasicFxValues;

export class CoverTextureMaterial extends FxBasicFxMaterial {
   static get type() {
      return "NoiseMaterial";
   }

   uniforms!: CoverTextureUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<CoverTextureValues> = {}) {
      super({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            src: { value: null },
            textureResolution: { value: new THREE.Vector2() },
         } as CoverTextureUniforms,
      });

      this.type = CoverTextureMaterial.type;
   }
}
