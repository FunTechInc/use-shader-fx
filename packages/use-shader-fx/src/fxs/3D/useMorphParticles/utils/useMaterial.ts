import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useResolution } from "../../../../utils/useResolution";
import { setUniform } from "../../../../utils/setUniforms";
import vertexShader from "../shader/main.vert";
import fragmentShader from "../shader/main.frag";
import { Size } from "@react-three/fiber";
import { MORPHPARTICLES_PARAMS } from "..";

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
      uDisplacement: { value: THREE.Texture };
      uIsDisplacement: { value: boolean };
      uDisplacementIntensity: { value: number };
      uDisplacementColorIntensity: { value: number };
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
               uMorphProgress: { value: MORPHPARTICLES_PARAMS.morphProgress },
               uBlurAlpha: { value: MORPHPARTICLES_PARAMS.blurAlpha },
               uBlurRadius: { value: MORPHPARTICLES_PARAMS.blurRadius },
               uPointSize: { value: MORPHPARTICLES_PARAMS.pointSize },
               uPicture: { value: new THREE.Texture() },
               uIsPicture: { value: false },
               uAlphaPicture: { value: new THREE.Texture() },
               uIsAlphaPicture: { value: false },
               uColor0: { value: MORPHPARTICLES_PARAMS.color0 },
               uColor1: { value: MORPHPARTICLES_PARAMS.color1 },
               uColor2: { value: MORPHPARTICLES_PARAMS.color2 },
               uColor3: { value: MORPHPARTICLES_PARAMS.color3 },
               uMap: { value: new THREE.Texture() },
               uIsMap: { value: false },
               uAlphaMap: { value: new THREE.Texture() },
               uIsAlphaMap: { value: false },
               uTime: { value: 0 },
               uWobblePositionFrequency: {
                  value: MORPHPARTICLES_PARAMS.wobblePositionFrequency,
               },
               uWobbleTimeFrequency: {
                  value: MORPHPARTICLES_PARAMS.wobbleTimeFrequency,
               },
               uWobbleStrength: { value: MORPHPARTICLES_PARAMS.wobbleStrength },
               uWarpPositionFrequency: {
                  value: MORPHPARTICLES_PARAMS.warpPositionFrequency,
               },
               uWarpTimeFrequency: {
                  value: MORPHPARTICLES_PARAMS.warpTimeFrequency,
               },
               uWarpStrength: { value: MORPHPARTICLES_PARAMS.warpStrength },
               uDisplacement: { value: new THREE.Texture() },
               uIsDisplacement: { value: false },
               uDisplacementIntensity: {
                  value: MORPHPARTICLES_PARAMS.displacementIntensity,
               },
               uDisplacementColorIntensity: {
                  value: MORPHPARTICLES_PARAMS.displacementColorIntensity,
               },
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
