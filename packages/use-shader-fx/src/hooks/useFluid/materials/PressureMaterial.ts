import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/pressure.frag";
import {
   FxMaterial,
   DefaultUniforms,
   FxMaterialProps,
} from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from "..";

type PressureUniforms = {
   isBounce: { value: boolean };
   pressure: { value: THREE.Texture };
   velocity: { value: THREE.Texture };
   dt: { value: number };
} & DefaultUniforms;

export class PressureMaterial extends FxMaterial {
   static get type() {
      return "PressureMaterial";
   }

   uniforms!: PressureUniforms;

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super();

      this.type = PressureMaterial.type;

      this.uniforms = {
         ...this.uniforms,
         ...{
            isBounce: { value: true },
            pressure: { value: DEFAULT_TEXTURE },
            velocity: { value: DEFAULT_TEXTURE },
            dt: { value: DeltaTime },
         },
      };

      this.setupDefaultShaders(vertex.main, fragment);

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);
   }
}
