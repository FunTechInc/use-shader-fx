import * as THREE from "three";
import { Size, RootState } from "@react-three/fiber";
import { useCreateObject } from "./utils/useCreateObject";
import { useMaterial, MorphParticlesMaterial } from "./utils/useMaterial";
import { MorphParticlesParams, MORPHPARTICLES_PARAMS } from ".";
import { setUniform } from "../../../utils/setUniforms";
import { useCallback, useEffect } from "react";

const DEFAULT_GEOMETRY = new THREE.SphereGeometry(1, 32, 32);

type UseCreateMorphParticlesProps = {
   size: Size;
   dpr: number;
   /** r3fのシーンを入れてもいいし、どのシーンにもaddしたくない場合は何も渡さないとシーンに入れずにオブジェクトだけ返すよ , default : false*/
   scene?: THREE.Scene | false;
   /** default : THREE.SphereGeometry(1, 32, 32) */
   geometry?: THREE.BufferGeometry;
   positions?: Float32Array[];
   uvs?: Float32Array[];
};

type UseCreateMorphParticlesReturn = [
   (props: RootState | null, params: MorphParticlesParams) => void,
   {
      points: THREE.Points;
      interactiveMesh: THREE.Mesh;
      positions: Float32Array[];
      uvs: Float32Array[];
   }
];

export const useCreateMorphParticles = ({
   size,
   dpr,
   scene = false,
   geometry = DEFAULT_GEOMETRY,
   positions,
   uvs,
}: UseCreateMorphParticlesProps): UseCreateMorphParticlesReturn => {
   const material = useMaterial({ size, dpr });
   const {
      object: points,
      interactiveMesh,
      positions: generatedPositions,
      uvs: generatedUvs,
   } = useCreateObject({
      scene,
      geometry,
      material,
      positions,
      uvs,
   });

   const updateUniform = useCallback(
      (props: RootState | null, params: MorphParticlesParams) => {
         const newParams = { ...MORPHPARTICLES_PARAMS, ...params };

         setUniform(material, "uMorphProgress", newParams.morphProgress!);
         setUniform(material, "uBlurAlpha", newParams.blurAlpha!);
         setUniform(material, "uBlurRadius", newParams.blurRadius!);
         setUniform(material, "uPointSize", newParams.pointSize!);
         if (newParams.picture) {
            setUniform(material, "uPicture", newParams.picture);
            setUniform(material, "uIsPicture", true);
         } else {
            setUniform(material, "uIsPicture", false);
         }
         if (newParams.alphaPicture) {
            setUniform(material, "uAlphaPicture", newParams.alphaPicture);
            setUniform(material, "uIsAlphaPicture", true);
         } else {
            setUniform(material, "uIsAlphaPicture", false);
         }
         setUniform(material, "uColor0", newParams.color0!);
         setUniform(material, "uColor1", newParams.color1!);
         setUniform(material, "uColor2", newParams.color2!);
         setUniform(material, "uColor3", newParams.color3!);
         if (newParams.map) {
            setUniform(material, "uMap", newParams.map);
            setUniform(material, "uIsMap", true);
         } else {
            setUniform(material, "uIsMap", false);
         }
         if (newParams.alphaMap) {
            setUniform(material, "uAlphaMap", newParams.alphaMap);
            setUniform(material, "uIsAlphaMap", true);
         } else {
            setUniform(material, "uIsAlphaMap", false);
         }
         if (props) {
            setUniform(
               material,
               "uTime",
               newParams.beat || props.clock.getElapsedTime()
            );
         }
         // wobble & warp
         setUniform(material, "uWobbleStrength", newParams.wobbleStrength!);
         setUniform(
            material,
            "uWobblePositionFrequency",
            newParams.wobblePositionFrequency!
         );
         setUniform(
            material,
            "uWobbleTimeFrequency",
            newParams.wobbleTimeFrequency!
         );
         setUniform(material, "uWarpStrength", newParams.warpStrength!);
         setUniform(
            material,
            "uWarpPositionFrequency",
            newParams.warpPositionFrequency!
         );
         setUniform(
            material,
            "uWarpTimeFrequency",
            newParams.warpTimeFrequency!
         );
         // displacement
         if (newParams.displacement) {
            setUniform(material, "uDisplacement", newParams.displacement);
            setUniform(material, "uIsDisplacement", true);
         } else {
            setUniform(material, "uIsDisplacement", false);
         }
         setUniform(
            material,
            "uDisplacementIntensity",
            newParams.displacementIntensity!
         );
         setUniform(
            material,
            "uDisplacementColorIntensity",
            newParams.displacementColorIntensity!
         );
      },
      [material]
   );

   return [
      updateUniform,
      {
         points: points as THREE.Points,
         interactiveMesh: interactiveMesh as THREE.Mesh,
         positions: generatedPositions,
         uvs: generatedUvs,
      },
   ];
};
