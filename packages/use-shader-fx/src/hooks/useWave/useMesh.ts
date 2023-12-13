import * as THREE from "three";
import { useEffect, useMemo } from "react";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../../utils/useAddMesh";
import { useResolution } from "../..";
import { Size } from "@react-three/fiber";

export class WaveMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uEpicenter: { value: THREE.Vector2 };
      uProgress: { value: number };
      uStrength: { value: number };
      uWidth: { value: number };
      uResolution: { value: THREE.Vector2 };
      uMode: { value: number };
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
               uEpicenter: { value: new THREE.Vector2(0.0, 0.0) },
               uProgress: { value: 0.0 },
               uStrength: { value: 0.0 },
               uWidth: { value: 0.0 },
               uResolution: { value: new THREE.Vector2() },
               uMode: { value: 0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   const resolution = useResolution(size, dpr);
   useEffect(() => {
      material.uniforms.uResolution.value = resolution.clone();
   }, [resolution, material]);

   useAddMesh(scene, geometry, material);

   return material as WaveMaterial;
};
