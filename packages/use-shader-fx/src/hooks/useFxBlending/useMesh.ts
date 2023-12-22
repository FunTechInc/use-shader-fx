import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../../utils/useAddMesh";

export class FxBlendingMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      u_map: { value: THREE.Texture };
      u_mapIntensity: { value: number };
   };
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               u_texture: { value: new THREE.Texture() },
               u_map: { value: new THREE.Texture() },
               u_mapIntensity: { value: 0.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );
   useAddMesh(scene, geometry, material);
   return material as FxBlendingMaterial;
};
