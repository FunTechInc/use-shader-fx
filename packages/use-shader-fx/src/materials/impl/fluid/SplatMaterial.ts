import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/splat.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";

type SplatUniforms = {
   forceBias: { value: number };
   radius: { value: THREE.Vector2 };
   force: { value: THREE.Vector2 };
   center: { value: THREE.Vector2 };
};

export type SplatValues = NestUniformValues<SplatUniforms>;
export type SplatValuesClient = Omit<SplatValues, "force" | "center">;

export class SplatMaterial extends FxMaterial {
   static get type() {
      return "SplatMaterial";
   }

   uniforms!: SplatUniforms;

   constructor(props: FxMaterialProps) {
      super({
         ...props,
         vertexShader: vertex.splat,
         fragmentShader: fragment,
         uniforms: {
            forceBias: { value: 20 },
            radius: { value: new THREE.Vector2(50, 50) },
            force: { value: new THREE.Vector2(0, 0) },
            center: { value: new THREE.Vector2(0, 0) },
         } as SplatUniforms,
      });

      this.type = SplatMaterial.type;

      this.blending = THREE.AdditiveBlending;
   }
}
