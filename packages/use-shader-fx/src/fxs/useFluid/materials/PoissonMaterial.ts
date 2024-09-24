import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/poisson.frag";
import { DefaultUniforms, FxMaterial } from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils.js";

type PoissonUniforms = {
   isBounce: { value: boolean };
   pressure: { value: THREE.Texture };
   divergence: { value: THREE.Texture };
} & DefaultUniforms;

export class PoissonMaterial extends FxMaterial {
   static get type() {
      return "PoissonMaterial";
   }

   uniforms!: PoissonUniforms;

   iteration: number;

   constructor(uniformValues = {}, parameters = {}) {
      super();

      this.type = PoissonMaterial.type;

      this.uniforms = mergeUniforms([
         this.uniforms,
         {
            isBounce: { value: true },
            pressure: { value: DEFAULT_TEXTURE },
            divergence: { value: DEFAULT_TEXTURE },
         },
      ]) as PoissonUniforms;

      this.iteration = 32;

      this.resolveDefaultShaders(vertex.poisson, fragment);

      this.setUniformValues(uniformValues);
      this.setValues(parameters);
   }
}
