import * as THREE from "three";
import { fragment, vertex } from "./coverTexture.glsl";
import {
   BasicFxUniforms,
   FxBasicFxMaterial,
} from "../materials/FxBasicFxMaterial";
import { CoverTextureValues } from ".";
import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils.js";

type CoverTextureUniforms = {
   src: { value: THREE.Texture | null };
   textureResolution: { value: THREE.Vector2 };
} & BasicFxUniforms;

export class CoverTextureMaterial extends FxBasicFxMaterial {
   static get type() {
      return "NoiseMaterial";
   }

   uniforms: CoverTextureUniforms;

   constructor(uniformValues?: CoverTextureValues, parameters = {}) {
      super();

      this.type = CoverTextureMaterial.type;

      this.uniforms = mergeUniforms([
         this.uniforms,
         {
            src: { value: null },
            textureResolution: { value: new THREE.Vector2() },
         },
      ]) as CoverTextureUniforms;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);

      this.setupBasicFxShaders(vertex, fragment);
   }
}
