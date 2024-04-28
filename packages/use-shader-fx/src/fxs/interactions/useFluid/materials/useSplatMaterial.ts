import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/splat.frag";
import { MaterialProps } from "../../../types";

export class SplatMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTarget: { value: THREE.Texture };
      aspectRatio: { value: number };
      color: { value: THREE.Vector3 | THREE.Color };
      point: { value: THREE.Vector2 };
      radius: { value: number };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useSplatMaterial = ({
   onBeforeCompile,
   uniforms,
}: MaterialProps) => {
   const splatMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uTarget: { value: new THREE.Texture() },
            aspectRatio: { value: 0 },
            color: { value: new THREE.Vector3() },
            point: { value: new THREE.Vector2() },
            radius: { value: 0.0 },
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

   return splatMaterial as SplatMaterial;
};
