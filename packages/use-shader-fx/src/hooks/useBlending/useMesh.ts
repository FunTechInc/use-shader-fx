import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../../utils/useAddMesh";

export class BlendingMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTime: { value: number };
      uTexture: { value: THREE.Texture };
      uMap: { value: THREE.Texture };
      distortionStrength: { value: number };
      edge0: { value: number };
      edge1: { value: number };
      color: { value: THREE.Color };
   };
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTime: { value: 0.0 },
               uTexture: { value: new THREE.Texture() },
               uMap: { value: new THREE.Texture() },
               distortionStrength: { value: 0.0 },
               edge0: { value: 0.0 },
               edge1: { value: 0.9 },
               color: { value: new THREE.Color(0xffffff) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );
   useAddMesh(scene, geometry, material);
   return material as BlendingMaterial;
};
