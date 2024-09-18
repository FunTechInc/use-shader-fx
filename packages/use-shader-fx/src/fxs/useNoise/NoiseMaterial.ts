import * as THREE from "three";
import { ShaderChunk } from "../../libs/shaders/ShaderChunk";
import fragment from "./noise.frag";
import {
   FxBlendingMaterial,
   FxBlendingUniforms,
} from "../materials/FxBlendingMaterial";
import { NoiseValues } from ".";

export class NoiseMaterial extends FxBlendingMaterial {
   static get type() {
      return "NoiseMaterial";
   }

   uniforms: {
      tick: { value: number };
      scale: { value: number };
      timeStrength: { value: number };
      noiseOctaves: { value: number };
      fbmOctaves: { value: number };
      warpOctaves: { value: number };
      warpDirection: { value: THREE.Vector2 };
      warpStrength: { value: number };
   } & FxBlendingUniforms;

   constructor(uniformValues?: NoiseValues, parameters = {}) {
      super(parameters);

      this.type = NoiseMaterial.type;

      this.uniforms = {
         tick: { value: 0.0 },
         scale: { value: 0.03 },
         timeStrength: { value: 0.3 },
         noiseOctaves: { value: 2 },
         fbmOctaves: { value: 2 },
         warpOctaves: { value: 2 },
         warpDirection: { value: new THREE.Vector2(2.0, 2.0) },
         warpStrength: { value: 8 },
         ...this.blendingUniforms,
      };

      this.resolveBlendingShader(ShaderChunk.blendingPlaneVertex, fragment);

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
