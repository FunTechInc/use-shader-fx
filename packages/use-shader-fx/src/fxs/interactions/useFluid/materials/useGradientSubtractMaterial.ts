import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/gradientSubtract.frag";
import { MaterialProps } from "../../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../../libs/constants";

export class GradientSubtractMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uPressure: { value: THREE.Texture };
      uVelocity: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useGradientSubtractMaterial = ({
   onBeforeCompile,
   uniforms,
}: MaterialProps) => {
   const gradientSubtractMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uPressure: { value: DEFAULT_TEXTURE },
            uVelocity: { value: DEFAULT_TEXTURE },
            texelSize: { value: new THREE.Vector2() },
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

   return gradientSubtractMaterial as GradientSubtractMaterial;
};
