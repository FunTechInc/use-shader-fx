import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/advection.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DELTA_TIME } from ".";
import { NestUniformValues } from "../../../shaders/uniformsUtils";

type AdvectionUniforms = {
   dissipation: { value: number };
   deltaTime: { value: number };
   velocity: { value: THREE.Texture };
};

export type AdvectionValues = NestUniformValues<AdvectionUniforms>;
export type AdvectionValuesClient = Omit<AdvectionValues, "velocity">;

export class AdvectionMaterial extends FxMaterial {
   static get type() {
      return "AdvectionMaterial";
   }

   uniforms!: AdvectionUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<AdvectionValues>) {
      super({
         vertexShader: vertex.advection,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            dissipation: { value: 0.99 },
            velocity: { value: DEFAULT_TEXTURE },
            deltaTime: { value: DELTA_TIME },
         } as AdvectionUniforms,
      });
      this.type = AdvectionMaterial.type;
   }
}
