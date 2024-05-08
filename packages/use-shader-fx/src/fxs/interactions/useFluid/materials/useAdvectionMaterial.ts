import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/advection.frag";
import { MaterialProps } from "../../../types";
import {
   DEFAULT_TEXTURE,
   MATERIAL_BASIC_PARAMS,
} from "../../../../libs/constants";
import { DELTA_TIME } from "..";

export class AdvectionMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uVelocity: { value: THREE.Texture };
      uSource: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
      dt: { value: number };
      dissipation: { value: number };
   };
}

export const useAdvectionMaterial = ({
   onBeforeCompile,
   uniforms,
}: MaterialProps) => {
   const advectionMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uVelocity: { value: DEFAULT_TEXTURE },
            uSource: { value: DEFAULT_TEXTURE },
            texelSize: { value: new THREE.Vector2() },
            dt: { value: DELTA_TIME },
            dissipation: { value: 0.0 },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
      });

      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile, uniforms]);

   return advectionMaterial as AdvectionMaterial;
};
