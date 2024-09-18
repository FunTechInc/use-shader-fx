import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/advection.frag";
import { FxMaterial } from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from "..";

export class AdvectionMaterial extends FxMaterial {
   static get type() {
      return "AdvectionMaterial";
   }

   uniforms: {
      texelsize: { value: THREE.Vector2 };
      ratio: { value: THREE.Vector2 };
      velocity: { value: THREE.Texture };
      dt: { value: number };
   };

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = AdvectionMaterial.type;

      this.uniforms = {
         texelsize: { value: new THREE.Vector2() },
         ratio: { value: new THREE.Vector2() },
         velocity: { value: DEFAULT_TEXTURE },
         dt: { value: DeltaTime },
      };

      this.vertexShader = vertex.advection;
      this.fragmentShader = fragment;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
