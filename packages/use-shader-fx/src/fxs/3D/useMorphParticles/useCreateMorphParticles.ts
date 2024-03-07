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
   geometry?: THREE.BufferGeometry;
   positions?: Float32Array[];
   uvs?: Float32Array[];
};

type UseCreateMorphParticlesReturn = [
   (props: RootState | null, params: MorphParticlesParams) => void,
   {
      points: THREE.Points;
      interactiveMesh: THREE.Mesh;
      material: MorphParticlesMaterial;
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
         params.morphProgress &&
            setUniform(material, "uMorphProgress", params.morphProgress);
         params.blurAlpha &&
            setUniform(material, "uBlurAlpha", params.blurAlpha);
         params.blurRadius &&
            setUniform(material, "uBlurRadius", params.blurRadius);
         params.pointSize &&
            setUniform(material, "uPointSize", params.pointSize);
         if (params.picture) {
            setUniform(material, "uPicture", params.picture);
            setUniform(material, "uIsPicture", true);
         } else {
            setUniform(material, "uIsPicture", false);
         }
         if (params.alphaPicture) {
            setUniform(material, "uAlphaPicture", params.alphaPicture);
            setUniform(material, "uIsAlphaPicture", true);
         } else {
            setUniform(material, "uIsAlphaPicture", false);
         }
         params.color0 && setUniform(material, "uColor0", params.color0);
         params.color1 && setUniform(material, "uColor1", params.color1);
         params.color2 && setUniform(material, "uColor2", params.color2);
         params.color3 && setUniform(material, "uColor3", params.color3);
         if (params.map) {
            setUniform(material, "uMap", params.map);
            setUniform(material, "uIsMap", true);
         } else {
            setUniform(material, "uIsMap", false);
         }
         if (params.alphaMap) {
            setUniform(material, "uAlphaMap", params.alphaMap);
            setUniform(material, "uIsAlphaMap", true);
         } else {
            setUniform(material, "uIsAlphaMap", false);
         }
         if (props) {
            setUniform(
               material,
               "uTime",
               params.beat || props.clock.getElapsedTime()
            );
         }
         // wobble & warp
         params.wobbleStrength &&
            setUniform(material, "uWobbleStrength", params.wobbleStrength);
         params.wobblePositionFrequency &&
            setUniform(
               material,
               "uWobblePositionFrequency",
               params.wobblePositionFrequency
            );
         params.wobbleTimeFrequency &&
            setUniform(
               material,
               "uWobbleTimeFrequency",
               params.wobbleTimeFrequency
            );
         params.warpStrength &&
            setUniform(material, "uWarpStrength", params.warpStrength);
         params.warpPositionFrequency &&
            setUniform(
               material,
               "uWarpPositionFrequency",
               params.warpPositionFrequency
            );
         params.warpTimeFrequency &&
            setUniform(
               material,
               "uWarpTimeFrequency",
               params.warpTimeFrequency
            );
         // displacement
         if (params.displacement) {
            setUniform(material, "uDisplacement", params.displacement);
            setUniform(material, "uIsDisplacement", true);
         } else {
            setUniform(material, "uIsDisplacement", false);
         }
         params.displacementColorIntensity &&
            setUniform(
               material,
               "uDisplacementColorIntensity",
               params.displacementColorIntensity
            );
      },
      [material]
   );

   //初期化時に デフォルト値への更新を保証したいので、`MORPHPARTICLES_PARAMS`で更新する
   useEffect(() => updateUniform(null, MORPHPARTICLES_PARAMS), [updateUniform]);

   return [
      updateUniform,
      {
         points: points as THREE.Points,
         interactiveMesh: interactiveMesh as THREE.Mesh,
         material,
         positions: generatedPositions,
         uvs: generatedUvs,
      },
   ];
};
