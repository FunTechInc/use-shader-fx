import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/clear.frag";
import { MaterialProps } from "../../../types";

export class ClearMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      value: { value: number };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useClearMaterial = ({
   onBeforeCompile,
   uniforms,
}: MaterialProps) => {
   const advectionMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uTexture: { value: new THREE.Texture() },
            value: { value: 0.0 },
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

   return advectionMaterial as ClearMaterial;
};
