import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/advection.frag";

export class AdvectionMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uVelocity: { value: THREE.Texture };
      uSource: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
      dt: { value: number };
      dissipation: { value: number };
   };
}

export const useAdvectionMaterial = () => {
   const advectionMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uVelocity: { value: new THREE.Texture() },
               uSource: { value: new THREE.Texture() },
               texelSize: { value: new THREE.Vector2() },
               dt: { value: 0.0 },
               dissipation: { value: 0.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return advectionMaterial as AdvectionMaterial;
};
