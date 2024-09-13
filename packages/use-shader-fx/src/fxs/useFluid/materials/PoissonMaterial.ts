import * as THREE from "three";
import vertex from "./shaders/face.vert";
import fragment from "./shaders/poisson.frag";
import { FxMaterial } from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class PoissonMaterial extends FxMaterial {
   static get type() {
      return "PoissonMaterial";
   }

   uniforms: {
      texelsize: { value: THREE.Vector2 };
      pressure: { value: THREE.Texture };
      divergence: { value: THREE.Texture };
   };

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = PoissonMaterial.type;

      this.uniforms = {
         texelsize: { value: new THREE.Vector2() },
         pressure: { value: DEFAULT_TEXTURE },
         divergence: { value: DEFAULT_TEXTURE },
      };

      this.vertexShader = vertex;
      this.fragmentShader = fragment;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
