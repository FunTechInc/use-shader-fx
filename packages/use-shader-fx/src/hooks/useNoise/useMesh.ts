import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../../utils/useAddMesh";

export class NoiseMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTime: { value: number };
      timeStrength: { value: number };
      noiseOctaves: { value: number };
      fbmOctaves: { value: number };
   };
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTime: { value: 0.0 },
               timeStrength: { value: 0.0 },
               noiseOctaves: { value: 0 },
               fbmOctaves: { value: 0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );
   useAddMesh(scene, geometry, material);
   return material as NoiseMaterial;
};
