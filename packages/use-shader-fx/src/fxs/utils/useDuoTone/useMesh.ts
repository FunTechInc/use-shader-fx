import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../../../utils/useAddMesh";

export class DuoToneMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      uColor0: { value: THREE.Color };
      uColor1: { value: THREE.Color };
   };
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTexture: { value: new THREE.Texture() },
               uColor0: { value: new THREE.Color(0xffffff) },
               uColor1: { value: new THREE.Color(0x000000) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   ) as DuoToneMaterial;
   useAddMesh(scene, geometry, material);
   return material;
};
