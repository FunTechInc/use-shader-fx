import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useResolution } from "../utils/useResolution";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../utils/useAddMesh";
import { Size } from "@react-three/fiber";

type TUniforms = {
   uResolution: { value: THREE.Vector2 };
   uImageResolution: { value: THREE.Vector2 };
   uTexture0: { value: THREE.Texture };
   uTexture1: { value: THREE.Texture };
   noise: { value: THREE.Texture };
   noiseStrength: { value: number };
   progress: { value: number };
   dirX: { value: number };
   dirY: { value: number };
};

export class MetamorphoseMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
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
               uResolution: { value: new THREE.Vector2() },
               uImageResolution: { value: new THREE.Vector2() },
               uTexture0: { value: new THREE.Texture() },
               uTexture1: { value: new THREE.Texture() },
               noise: { value: new THREE.Texture() },
               noiseStrength: { value: 0.0 },
               progress: { value: 0.0 },
               dirX: { value: 0.0 },
               dirY: { value: 0.0 },
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

   return material as MetamorphoseMaterial;
};
