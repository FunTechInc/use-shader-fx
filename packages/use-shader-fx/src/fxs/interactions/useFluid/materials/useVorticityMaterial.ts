import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/vorticity.frag";
import { MaterialProps } from "../../../types";

export class VorticityMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uVelocity: { value: THREE.Texture };
      uCurl: { value: THREE.Texture };
      curl: { value: number };
      dt: { value: number };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useVorticityMaterial = ({ onBeforeCompile }: MaterialProps) => {
   const vorticityMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uVelocity: { value: null },
            uCurl: { value: null },
            curl: { value: 0 },
            dt: { value: 0 },
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

   return vorticityMaterial as VorticityMaterial;
};
