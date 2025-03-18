import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/divergence.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DELTA_TIME } from ".";
import { NestUniformValues } from "../../../shaders/uniformsUtils";

type DivergenceUniforms = {
   bounce: { value: boolean };
   deltaTime: { value: number };
   velocity: { value: THREE.Texture };
};

export type DivergenceValues = NestUniformValues<DivergenceUniforms>;
export type DivergenceValuesClient = Omit<DivergenceValues, "velocity">;

export class DivergenceMaterial extends FxMaterial {
   static get type() {
      return "DivergenceMaterial";
   }

   uniforms!: DivergenceUniforms;

   constructor(props: FxMaterialProps<DivergenceValues>) {
      super({
         ...props,
         vertexShader: vertex.main,
         fragmentShader: fragment,
         uniforms: {
            bounce: { value: true },
            velocity: { value: DEFAULT_TEXTURE },
            deltaTime: { value: DELTA_TIME },
         } as DivergenceUniforms,
      });

      this.type = DivergenceMaterial.type;
   }
}
