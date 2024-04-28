import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/pressure.frag";
import { MaterialProps } from "../../../types";

export class PressureMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uPressure: { value: THREE.Texture };
      uDivergence: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const usePressureMaterial = ({
   onBeforeCompile,
   uniforms,
}: MaterialProps) => {
   const pressureMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uPressure: { value: null },
            uDivergence: { value: null },
            texelSize: { value: new THREE.Vector2() },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile, uniforms]);

   return pressureMaterial as PressureMaterial;
};
