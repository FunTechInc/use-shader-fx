import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/splat.frag";
import { FxMaterial } from "../../materials/FxMaterial";

export class SplatMaterial extends FxMaterial {
   static get type() {
      return "SplatMaterial";
   }

   force: number;

   uniforms: {
      texelsize: { value: THREE.Vector2 };
      force: { value: THREE.Vector2 };
      center: { value: THREE.Vector2 };
      scale: { value: THREE.Vector2 };
   };

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = SplatMaterial.type;

      this.force = 30;

      this.uniforms = {
         texelsize: { value: new THREE.Vector2() },
         force: { value: new THREE.Vector2(0, 0) },
         center: { value: new THREE.Vector2(0, 0) },
         scale: { value: new THREE.Vector2(80, 80) },
      };

      this.vertexShader = vertex.splat;
      this.fragmentShader = fragment;

      this.blending = THREE.AdditiveBlending;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
