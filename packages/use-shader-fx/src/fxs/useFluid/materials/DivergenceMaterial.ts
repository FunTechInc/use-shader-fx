import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/divergence.frag";
import { FxMaterial } from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from "..";

export class DivergenceMaterial extends FxMaterial {
   static get type() {
      return "DivergenceMaterial";
   }

   uniforms: {
      texelsize: { value: THREE.Vector2 };
      isBounce: { value: boolean };
      velocity: { value: THREE.Texture };
      dt: { value: number };
   };

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = DivergenceMaterial.type;

      this.uniforms = {
         texelsize: { value: new THREE.Vector2() },
         isBounce: { value: true },
         velocity: { value: DEFAULT_TEXTURE },
         dt: { value: DeltaTime },
      };

      this.vertexShader = vertex.main;
      this.fragmentShader = fragment;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
