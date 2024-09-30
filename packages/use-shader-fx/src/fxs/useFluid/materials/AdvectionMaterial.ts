import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/advection.frag";
import {
   FxMaterial,
   DefaultUniforms,
   FxMaterialProps,
} from "../../materials/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from "..";

type AdvectionUniforms = {
   velocity: { value: THREE.Texture };
   dt: { value: number };
} & DefaultUniforms;

export class AdvectionMaterial extends FxMaterial {
   static get type() {
      return "AdvectionMaterial";
   }

   uniforms!: AdvectionUniforms;

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super();

      this.type = AdvectionMaterial.type;

      this.uniforms = {
         ...this.uniforms,
         ...{
            velocity: { value: DEFAULT_TEXTURE },
            dt: { value: DeltaTime },
         },
      };

      this.setupDefaultShaders(vertex.advection, fragment);

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);
   }
}
