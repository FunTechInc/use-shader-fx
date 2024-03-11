import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useMemo } from "react";
import { Size } from "@react-three/fiber";
import { useAddObject } from "../../../utils/useAddObject";

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
   ) as AlphaBlendingMaterial;

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
