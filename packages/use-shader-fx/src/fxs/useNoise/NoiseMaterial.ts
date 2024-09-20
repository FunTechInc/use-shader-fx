import * as THREE from "three";
import { noiseFragment, noiseVertex } from "./noise.glsl";
import {
   BasicFxUniforms,
   FxBasicFxMaterial,
} from "../materials/FxBasicFxMaterial";
import { NoiseValues } from ".";
import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils.js";

type NoiseUniforms = {
   tick: { value: number };
   scale: { value: number };
   timeStrength: { value: number };
   noiseOctaves: { value: number };
   fbmOctaves: { value: number };
   warpOctaves: { value: number };
   warpDirection: { value: THREE.Vector2 };
   warpStrength: { value: number };
} & BasicFxUniforms;

export class NoiseMaterial extends FxBasicFxMaterial {
   static get type() {
      return "NoiseMaterial";
   }

   uniforms: NoiseUniforms;

   constructor(uniformValues?: NoiseValues, parameters = {}) {
      super();

      this.type = NoiseMaterial.type;

      this.uniforms = mergeUniforms([
         this.uniforms,
         {
            tick: { value: 0.0 },
            scale: { value: 0.03 },
            timeStrength: { value: 0.3 },
            noiseOctaves: { value: 2 },
            fbmOctaves: { value: 2 },
            warpOctaves: { value: 2 },
            warpDirection: { value: new THREE.Vector2(2.0, 2.0) },
            warpStrength: { value: 8 },
         },
      ]) as NoiseUniforms;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);

      this.setupBasicFxShaders(noiseVertex, noiseFragment);
   }
}
