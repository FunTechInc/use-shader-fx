import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useResolution } from "../../../../utils/useResolution";
import { setUniform } from "../../../../utils/setUniforms";
import vertexShader from "../shader/main.vert";
import fragmentShader from "../shader/main.frag";
import { Size } from "@react-three/fiber";

export class MorphParticlesMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uResolution: { value: THREE.Vector2 };
      uMorphProgress: { value: number };
      uBlurAlpha: { value: number };
      uBlurRadius: { value: number };
      uPointSize: { value: number };
      uPicture: { value: THREE.Texture };
      uIsPicture: { value: boolean };
      uAlphaPicture: { value: THREE.Texture };
      uIsAlphaPicture: { value: boolean };
      uColor0: { value: THREE.Color };
      uColor1: { value: THREE.Color };
      uColor2: { value: THREE.Color };
      uColor3: { value: THREE.Color };
      uMap: { value: THREE.Texture };
      uIsMap: { value: boolean };
      uAlphaMap: { value: THREE.Texture };
      uIsAlphaMap: { value: boolean };
      uTime: { value: number };
      uWobblePositionFrequency: { value: number };
      uWobbleTimeFrequency: { value: number };
      uWobbleStrength: { value: number };
      uWarpPositionFrequency: { value: number };
      uWarpTimeFrequency: { value: number };
      uWarpStrength: { value: number };
   };
}

export const useMaterial = ({ size, dpr }: { size: Size; dpr: number }) => {
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            blending: THREE.AdditiveBlending,
            uniforms: {
               uResolution: { value: new THREE.Vector2(0, 0) },
               uMorphProgress: { value: 0 },
               uBlurAlpha: { value: 0 },
               uBlurRadius: { value: 0 },
               uPointSize: { value: 0 },
               uPicture: { value: new THREE.Texture() },
               uIsPicture: { value: false },
               uAlphaPicture: { value: new THREE.Texture() },
               uIsAlphaPicture: { value: false },
               uColor0: { value: new THREE.Color() },
               uColor1: { value: new THREE.Color() },
               uColor2: { value: new THREE.Color() },
               uColor3: { value: new THREE.Color() },
               uMap: { value: new THREE.Texture() },
               uIsMap: { value: false },
               uAlphaMap: { value: new THREE.Texture() },
               uIsAlphaMap: { value: false },
               uTime: { value: 0 },
               uWobblePositionFrequency: { value: 0 },
               uWobbleTimeFrequency: { value: 0 },
               uWobbleStrength: { value: 0 },
               uWarpPositionFrequency: { value: 0 },
               uWarpTimeFrequency: { value: 0 },
               uWarpStrength: { value: 0 },
            },
         }),
      []
   );
   const resolution = useResolution(size, dpr);
   useEffect(() => {
      setUniform(material, "uResolution", resolution.clone());
   }, [resolution, material]);

   return material as MorphParticlesMaterial;
};
