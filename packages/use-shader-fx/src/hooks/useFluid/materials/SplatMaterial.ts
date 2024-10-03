import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/splat.frag";
import {
   DefaultUniforms,
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/FxMaterial";

type SplatUniforms = {
   force: { value: THREE.Vector2 };
   center: { value: THREE.Vector2 };
   scale: { value: THREE.Vector2 };
} & DefaultUniforms;

export class SplatMaterial extends FxMaterial {
   static get type() {
      return "SplatMaterial";
   }

   force: number;

   uniforms!: SplatUniforms;

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super();

      this.type = SplatMaterial.type;

      this.force = 30;

      this.uniforms = THREE.UniformsUtils.merge([
         this.uniforms,
         {
            force: { value: new THREE.Vector2(0, 0) },
            center: { value: new THREE.Vector2(0, 0) },
            scale: { value: new THREE.Vector2(30, 30) },
         },
      ]) as SplatUniforms;

      this.setupDefaultShaders(vertex.splat, fragment);

      this.blending = THREE.AdditiveBlending;

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);
   }
}
