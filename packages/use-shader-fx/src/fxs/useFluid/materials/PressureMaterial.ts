import * as THREE from "three";
import vertex from "./shaders/face.vert";
import fragment from "./shaders/pressure.frag";
import { FxMaterial } from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class PressureMaterial extends FxMaterial {
   static get type() {
      return "PressureMaterial";
   }

   uniforms: {
      texelsize: { value: THREE.Vector2 };
      pressure: { value: THREE.Texture };
      velocity: { value: THREE.Texture };
      dt: { value: number };
   };

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = PressureMaterial.type;

      this.uniforms = {
         texelsize: { value: new THREE.Vector2() },
         pressure: { value: DEFAULT_TEXTURE },
         velocity: { value: DEFAULT_TEXTURE },
         dt: { value: 0.014 },
      };

      this.vertexShader = vertex;
      this.fragmentShader = fragment;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
