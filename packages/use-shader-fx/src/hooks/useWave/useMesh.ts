import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../../utils/useAddMesh";
import { Size } from "@react-three/fiber";

export class WaveMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uEpicenter: { value: THREE.Vector2 };
      uProgress: { value: number };
      uStrength: { value: number };
      uWidth: { value: number };
      uMode: { value: number };
   };
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uEpicenter: { value: new THREE.Vector2(0.0, 0.0) },
               uProgress: { value: 0.0 },
               uStrength: { value: 0.0 },
               uWidth: { value: 0.0 },
               uMode: { value: 0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   useAddMesh(scene, geometry, material);

   return material as WaveMaterial;
};
