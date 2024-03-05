import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useResolution } from "../../../utils/useResolution";
import { setUniform } from "../../../utils/setUniforms";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { Size } from "@react-three/fiber";

export class ParticlesMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTime: { value: number };
      uResolution: { value: THREE.Vector2 };
      uMorphProgress: { value: number };
      // uMorphLength: { value: number };
   };
}

export const useMaterial = ({ size, dpr }: { size: Size; dpr: number }) => {
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            depthTest: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            uniforms: {
               uTime: { value: 0 },
               uResolution: { value: new THREE.Vector2(0, 0) },
               uMorphProgress: { value: 0 },
               // uMorphLength: { value: 0 },
            },
         }),
      []
   );
   const resolution = useResolution(size, dpr);
   useEffect(() => {
      setUniform(material, "uResolution", resolution.clone());
   }, [resolution, material]);

   // const points = useAddObject(scene, geometry, material, THREE.Points);

   return material as ParticlesMaterial;
};
