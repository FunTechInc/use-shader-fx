import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useMemo } from "react";
import { useAddMesh } from "../../utils/useAddMesh";
import { Size } from "@react-three/fiber";

export class AlphaBlendingMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      uMap: { value: THREE.Texture };
   };
}

export const useMesh = ({
   scene,
   size,
   dpr,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number;
}) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTexture: { value: new THREE.Texture() },
               uMap: { value: new THREE.Texture() },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   useAddMesh(scene, geometry, material);
   return material as AlphaBlendingMaterial;
};
