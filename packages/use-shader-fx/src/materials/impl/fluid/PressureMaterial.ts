import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/pressure.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DELTA_TIME } from ".";
import { NestUniformValues } from "../../../shaders/uniformsUtils";

type PressureUniforms = {
   bounce: { value: boolean };
   deltaTime: { value: number };
   pressure: { value: THREE.Texture };
   velocity: { value: THREE.Texture };
};

export type PressureValues = NestUniformValues<PressureUniforms>;
export type PressureValuesClient = Omit<
   PressureValues,
   "velocity" | "pressure"
>;

export class PressureMaterial extends FxMaterial {
   static get type() {
      return "PressureMaterial";
   }

   uniforms!: PressureUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<PressureValues>) {
      super({
         vertexShader: vertex.main,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            bounce: { value: true },
            deltaTime: { value: DELTA_TIME },
            pressure: { value: DEFAULT_TEXTURE },
            velocity: { value: DEFAULT_TEXTURE },
         } as PressureUniforms,
      });

      this.type = PressureMaterial.type;
   }
}
