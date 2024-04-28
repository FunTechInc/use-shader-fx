import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/divergence.frag";
import { MaterialProps } from "../../../types";

export class DivergenceMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uVelocity: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useDivergenceMaterial = ({
   onBeforeCompile,
   uniforms,
}: MaterialProps) => {
   const divergenceMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uVelocity: { value: null },
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

   return divergenceMaterial as DivergenceMaterial;
};
