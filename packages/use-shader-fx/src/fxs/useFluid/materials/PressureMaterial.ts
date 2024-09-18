import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/pressure.frag";
import { FxMaterial } from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from "..";

export class PressureMaterial extends FxMaterial {
   static get type() {
      return "PressureMaterial";
   }

   uniforms: {
      texelsize: { value: THREE.Vector2 };
      isBounce: { value: boolean };
      pressure: { value: THREE.Texture };
      velocity: { value: THREE.Texture };
      dt: { value: number };
   };

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = PressureMaterial.type;

      this.uniforms = {
         texelsize: { value: new THREE.Vector2() },
         isBounce: { value: true },
         pressure: { value: DEFAULT_TEXTURE },
         velocity: { value: DEFAULT_TEXTURE },
         dt: { value: DeltaTime },
      };

      this.vertexShader = vertex.main;
      this.fragmentShader = fragment;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
