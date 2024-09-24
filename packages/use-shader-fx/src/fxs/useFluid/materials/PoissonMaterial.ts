import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/poisson.frag";
import {
   DefaultUniforms,
   FxMaterial,
   FxMaterialProps,
} from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

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

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super();

      this.type = PoissonMaterial.type;

      this.uniforms = {
         ...this.uniforms,
         ...{
            isBounce: { value: true },
            pressure: { value: DEFAULT_TEXTURE },
            divergence: { value: DEFAULT_TEXTURE },
         },
      };

      this.iteration = 32;

      this.resolveDefaultShaders(vertex.poisson, fragment);

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);
   }
}
