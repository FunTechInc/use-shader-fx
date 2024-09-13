import * as THREE from "three";
import { ShaderChunk } from "../../libs/shaders/ShaderChunk";
import fragment from "./noise.frag";
import { FxMaterial } from "../materials/FxMaterial";
import { NoiseValues } from ".";

export class NoiseMaterial extends FxMaterial {
   static get type() {
      return "NoiseMaterial";
   }

   uniforms: {
      uTime: { value: number };
      scale: { value: number };
      timeStrength: { value: number };
      noiseOctaves: { value: number };
      fbmOctaves: { value: number };
      warpOctaves: { value: number };
      warpDirection: { value: THREE.Vector2 };
      warpStrength: { value: number };
   };

   constructor(uniformValues?: NoiseValues, parameters = {}) {
      super();

      this.type = NoiseMaterial.type;

      this.uniforms = {
         uTime: { value: 0.0 },
         scale: { value: 0.03 },
         timeStrength: { value: 0.3 },
         noiseOctaves: { value: 2 },
         fbmOctaves: { value: 2 },
         warpOctaves: { value: 2 },
         warpDirection: { value: new THREE.Vector2(2.0, 2.0) },
         warpStrength: { value: 8 },
      };

      this.vertexShader = ShaderChunk.planeVertex;
      this.fragmentShader = fragment;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
