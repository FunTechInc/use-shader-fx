import * as THREE from "three";
import vertex from "./shaders/splat.vert";
import fragment from "./shaders/splat.frag";
import { FxMaterial } from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class SplatMaterial extends FxMaterial {
   static get type() {
      return "SplatMaterial";
   }

   uniforms: {
      texelsize: { value: THREE.Vector2 };
      force: { value: THREE.Vector2 };
      center: { value: THREE.Vector2 };
      scale: { value: THREE.Vector2 };
   };

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = SplatMaterial.type;

      this.uniforms = {
         texelsize: { value: new THREE.Vector2() },
         force: { value: new THREE.Vector2(10, 10) },
         center: { value: new THREE.Vector2(0, 0) },
         scale: { value: new THREE.Vector2(100, 100) },
      };

      this.vertexShader = vertex;
      this.fragmentShader = fragment;

      this.blending = THREE.AdditiveBlending;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
