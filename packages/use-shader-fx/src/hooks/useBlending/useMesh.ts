import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../../utils/useAddMesh";

export class BlendingMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      u_map: { value: THREE.Texture };
      u_mapIntensity: { value: number };
      u_brightness: { value: THREE.Vector3 };
      u_min: { value: number };
      u_max: { value: number };
      u_color: { value: THREE.Color };
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
               u_brightness: { value: new THREE.Vector3() },
               u_min: { value: 0.0 },
               u_max: { value: 0.9 },
               u_color: { value: new THREE.Color(0xffffff) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );
   useAddMesh(scene, geometry, material);
   return material as BlendingMaterial;
};
