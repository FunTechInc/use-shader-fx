import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/splat.frag";

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

export const useSplateMaterial = () => {
   const splatMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTarget: { value: new THREE.Texture() },
               aspectRatio: { value: 0 },
               color: { value: new THREE.Vector3() },
               point: { value: new THREE.Vector2() },
               radius: { value: 0.0 },
               texelSize: { value: new THREE.Vector2() },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return splatMaterial as SplatMaterial;
};
