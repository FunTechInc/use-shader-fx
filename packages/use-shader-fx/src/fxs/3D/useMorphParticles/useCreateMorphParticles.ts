import * as THREE from "three";
import { Size, RootState } from "@react-three/fiber";
import {
   InteractiveMesh,
   MorphParticlePoints,
   useCreateObject,
} from "./utils/useCreateObject";
import { useMaterial } from "./utils/useMaterial";
import { MorphParticlesParams } from ".";
import {
   setUniform,
   CustomParams,
   setCustomUniform,
} from "../../../utils/setUniforms";
import { useCallback, useMemo } from "react";
import { Create3DHooksProps } from "../types";
import { Dpr } from "../../types";
import { getDpr } from "../../../utils/getDpr";

export type UseCreateMorphParticlesProps = {
   size: Size;
   dpr: Dpr;
   /** default : `THREE.SphereGeometry(1, 32, 32)` */
   geometry?: THREE.BufferGeometry;
   positions?: Float32Array[];
   uvs?: Float32Array[];
   /** Array of textures to map to points. Mapped at random. */
   mapArray?: THREE.Texture[];
};

type UpdateUniform = (
   props: RootState | null,
   params?: MorphParticlesParams,
   customParams?: CustomParams
) => void;

type UseCreateMorphParticlesReturn = [
   UpdateUniform,
   {
      points: MorphParticlePoints;
      interactiveMesh: InteractiveMesh;
      positions: Float32Array[];
      uvs: Float32Array[];
   }
];

export const useCreateMorphParticles = ({
   size,
   dpr,
   scene = false,
   geometry,
   positions,
   uvs,
   mapArray,
   uniforms,
   onBeforeCompile,
}: Create3DHooksProps &
   UseCreateMorphParticlesProps): UseCreateMorphParticlesReturn => {
   const _dpr = getDpr(dpr);

   const morphGeometry = useMemo(() => {
      const geo = geometry || new THREE.SphereGeometry(1, 32, 32);
      geo.setIndex(null);
      // Since it is a particle, normal is not necessary
      geo.deleteAttribute("normal");
      return geo;
   }, [geometry]);

   const { material, modifiedPositions, modifiedUvs } = useMaterial({
      size,
      dpr: _dpr.shader,
      geometry: morphGeometry,
      positions,
      uvs,
      mapArray,
      uniforms,
      onBeforeCompile,
   });

   const { points, interactiveMesh } = useCreateObject({
      scene,
      geometry: morphGeometry,
      material,
   });

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateUniform = useCallback<UpdateUniform>(
      (props, newParams, customParams) => {
         if (props) {
            updateValue(
               "uTime",
               newParams?.beat || props.clock.getElapsedTime()
            );
         }
         if (newParams === undefined) {
            return;
         }
         updateValue("uMorphProgress", newParams.morphProgress);
         updateValue("uBlurAlpha", newParams.blurAlpha);
         updateValue("uBlurRadius", newParams.blurRadius);
         updateValue("uPointSize", newParams.pointSize);
         updateValue("uPointAlpha", newParams.pointAlpha);
         if (newParams.picture) {
            updateValue("uPicture", newParams.picture);
            updateValue("uIsPicture", true);
         } else if (newParams.picture === false) {
            updateValue("uIsPicture", false);
         }
         if (newParams.alphaPicture) {
            updateValue("uAlphaPicture", newParams.alphaPicture);
            updateValue("uIsAlphaPicture", true);
         } else if (newParams.alphaPicture === false) {
            updateValue("uIsAlphaPicture", false);
         }
         updateValue("uColor0", newParams.color0);
         updateValue("uColor1", newParams.color1);
         updateValue("uColor2", newParams.color2);
         updateValue("uColor3", newParams.color3);
         if (newParams.map) {
            updateValue("uMap", newParams.map);
            updateValue("uIsMap", true);
         } else if (newParams.map === false) {
            updateValue("uIsMap", false);
         }
         if (newParams.alphaMap) {
            updateValue("uAlphaMap", newParams.alphaMap);
            updateValue("uIsAlphaMap", true);
         } else if (newParams.alphaMap === false) {
            updateValue("uIsAlphaMap", false);
         }
         updateValue("uWobbleStrength", newParams.wobbleStrength);
         updateValue(
            "uWobblePositionFrequency",
            newParams.wobblePositionFrequency
         );
         updateValue("uWobbleTimeFrequency", newParams.wobbleTimeFrequency);
         updateValue("uWarpStrength", newParams.warpStrength);
         updateValue("uWarpPositionFrequency", newParams.warpPositionFrequency);
         updateValue("uWarpTimeFrequency", newParams.warpTimeFrequency);
         if (newParams.displacement) {
            updateValue("uDisplacement", newParams.displacement);
            updateValue("uIsDisplacement", true);
         } else if (newParams.displacement === false) {
            updateValue("uIsDisplacement", false);
         }
         updateValue("uDisplacementIntensity", newParams.displacementIntensity);
         updateValue(
            "uDisplacementColorIntensity",
            newParams.displacementColorIntensity
         );
         updateValue("uSizeRandomIntensity", newParams.sizeRandomIntensity);
         updateValue(
            "uSizeRandomTimeFrequency",
            newParams.sizeRandomTimeFrequency
         );
         updateValue("uSizeRandomMin", newParams.sizeRandomMin);
         updateValue("uSizeRandomMax", newParams.sizeRandomMax);
         updateValue("uDivergence", newParams.divergence);
         updateValue("uDivergencePoint", newParams.divergencePoint);

         updateCustomValue(customParams);
      },
      [updateValue, updateCustomValue]
   );

   return [
      updateUniform,
      {
         points,
         interactiveMesh,
         positions: modifiedPositions,
         uvs: modifiedUvs,
      },
   ];
};
