import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useResolution } from "../../../utils/useResolution";
import { setUniform } from "../../../utils/setUniforms";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { Size } from "@react-three/fiber";

export class Morph3DMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uResolution: { value: THREE.Vector2 };
      uMorphProgress: { value: number };
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
            uniforms: {
               uResolution: { value: new THREE.Vector2(0, 0) },
               uMorphProgress: { value: 0 },
            },
         }),
      []
   );
   const resolution = useResolution(size, dpr);
   useEffect(() => {
      setUniform(material, "uResolution", resolution.clone());
   }, [resolution, material]);

   return material as Morph3DMaterial;
};
