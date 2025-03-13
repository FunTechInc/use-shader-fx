import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/poisson.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { NestUniformValues } from "../../../shaders/uniformsUtils";

type PoissonUniforms = {
   bounce: { value: boolean };
   pressure: { value: THREE.Texture };
   divergence: { value: THREE.Texture };
};

export type PoissonValues = NestUniformValues<PoissonUniforms>;
export type PoissonValuesClient = Omit<
   PoissonValues,
   "pressure" | "divergence"
>;

export class PoissonMaterial extends FxMaterial {
   static get type() {
      return "PoissonMaterial";
   }

   uniforms!: PoissonUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<PoissonValues>) {
      super({
         vertexShader: vertex.poisson,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            bounce: { value: true },
            pressure: { value: DEFAULT_TEXTURE },
            divergence: { value: DEFAULT_TEXTURE },
         } as PoissonUniforms,
      });
      this.type = PoissonMaterial.type;
   }
}
