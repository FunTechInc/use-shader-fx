import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/splat.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";

type SplatUniforms = {
   force: { value: THREE.Vector2 };
   center: { value: THREE.Vector2 };
   scale: { value: THREE.Vector2 };
};

export type SplatValues = NestUniformValues<SplatUniforms>;
export type SplatValuesClient = Omit<SplatValues, "force" | "center">;

export class SplatMaterial extends FxMaterial {
   static get type() {
      return "SplatMaterial";
   }

   uniforms!: SplatUniforms;

   forceBias: number;

   constructor({ customParameters, ...rest }: FxMaterialProps) {
      super({
         ...rest,
         vertexShader: vertex.splat,
         fragmentShader: fragment,
         uniforms: {
            force: { value: new THREE.Vector2(0, 0) },
            center: { value: new THREE.Vector2(0, 0) },
            scale: { value: new THREE.Vector2(50, 50) },
         } as SplatUniforms,
      });

      this.type = SplatMaterial.type;

      this.forceBias = customParameters?.forceBias ?? 20;

      this.blending = THREE.AdditiveBlending;
   }
}
