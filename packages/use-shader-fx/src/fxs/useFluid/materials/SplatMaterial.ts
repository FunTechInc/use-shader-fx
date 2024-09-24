import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/splat.frag";
import { DefaultUniforms, FxMaterial } from "../../materials/FxMaterial";
import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils.js";

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

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = SplatMaterial.type;

      this.force = 30;

      this.uniforms = mergeUniforms([
         this.uniforms,
         {
            force: { value: new THREE.Vector2(0, 0) },
            center: { value: new THREE.Vector2(0, 0) },
            scale: { value: new THREE.Vector2(20, 20) },
         },
      ]) as SplatUniforms;

      this.resolveDefaultShaders(vertex.splat, fragment);

      this.blending = THREE.AdditiveBlending;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
