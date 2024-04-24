import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/gradientSubtract.frag";
import { MaterialProps } from "../../../types";

export class GradientSubtractMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uPressure: { value: THREE.Texture };
      uVelocity: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useGradientSubtractMaterial = ({
   onBeforeCompile,
}: MaterialProps) => {
   const gradientSubtractMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uPressure: { value: new THREE.Texture() },
            uVelocity: { value: new THREE.Texture() },
            texelSize: { value: new THREE.Vector2() },
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile]);

   return gradientSubtractMaterial as GradientSubtractMaterial;
};
