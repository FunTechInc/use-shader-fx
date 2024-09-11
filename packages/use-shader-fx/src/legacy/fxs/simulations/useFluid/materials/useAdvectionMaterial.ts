import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/face.vert";
import fragmentShader from "../shaders/advection.frag";
import { MaterialProps } from "../../../types";
import {
   DEFAULT_TEXTURE,
   MATERIAL_BASIC_PARAMS,
} from "../../../../libs/constants";
import { DELTA_TIME } from "..";
import { createMaterialParameters } from "../../../../utils/createMaterialParameters";

export class AdvectionMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uVelocity: { value: THREE.Texture };
      uSource: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
      dt: { value: number };
      dissipation: { value: number };
      resolution: { value: THREE.Vector2 };
   };
}

export const useAdvectionMaterial = ({ onBeforeInit }: MaterialProps) => {
   const advectionMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  uVelocity: { value: DEFAULT_TEXTURE },
                  uSource: { value: DEFAULT_TEXTURE },
                  texelSize: { value: new THREE.Vector2() },
                  dt: { value: DELTA_TIME },
                  dissipation: { value: 0.0 },
                  resolution: { value: new THREE.Vector2() },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });

      return mat;
   }, [onBeforeInit]);

   return advectionMaterial as AdvectionMaterial;
};
