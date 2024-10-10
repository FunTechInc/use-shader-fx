import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/divergence.frag";
import {
   FxMaterial,
   DefaultUniforms,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from "..";

type DivergenceUniforms = {
   isBounce: { value: boolean };
   velocity: { value: THREE.Texture };
   dt: { value: number };
} & DefaultUniforms;

export class DivergenceMaterial extends FxMaterial {
   static get type() {
      return "DivergenceMaterial";
   }

   uniforms!: DivergenceUniforms;

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super();

      this.type = DivergenceMaterial.type;

      this.uniforms = THREE.UniformsUtils.merge([
         this.uniforms,
         {
            isBounce: { value: true },
            velocity: { value: DEFAULT_TEXTURE },
            dt: { value: DeltaTime },
         },
      ]) as DivergenceUniforms;

      this.setupDefaultShaders(vertex.main, fragment);

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);
   }
}
