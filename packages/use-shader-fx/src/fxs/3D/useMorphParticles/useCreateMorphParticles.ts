import * as THREE from "three";
import { Size, RootState } from "@react-three/fiber";
import {
   InteractiveMesh,
   MorphParticlePoints,
   useCreateObject,
} from "./utils/useCreateObject";
import { useMaterial } from "./utils/useMaterial";
import { MorphParticlesParams } from ".";
import { setUniform } from "../../../utils/setUniforms";
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
   params?: MorphParticlesParams
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
      onBeforeCompile,
   });

   const { points, interactiveMesh } = useCreateObject({
      scene,
      geometry: morphGeometry,
      material,
   });

   const updateValue = setUniform(material);
   const updateUniform = useCallback<UpdateUniform>(
      (props, params) => {
         if (props) {
            updateValue("uTime", params?.beat || props.clock.getElapsedTime());
         }
         if (params === undefined) {
            return;
         }
         updateValue("uMorphProgress", params.morphProgress);
         updateValue("uBlurAlpha", params.blurAlpha);
         updateValue("uBlurRadius", params.blurRadius);
         updateValue("uPointSize", params.pointSize);
         updateValue("uPointAlpha", params.pointAlpha);
         if (params.picture) {
            updateValue("uPicture", params.picture);
            updateValue("uIsPicture", true);
         } else if (params.picture === false) {
            updateValue("uIsPicture", false);
         }
         if (params.alphaPicture) {
            updateValue("uAlphaPicture", params.alphaPicture);
            updateValue("uIsAlphaPicture", true);
         } else if (params.alphaPicture === false) {
            updateValue("uIsAlphaPicture", false);
         }
         updateValue("uColor0", params.color0);
         updateValue("uColor1", params.color1);
         updateValue("uColor2", params.color2);
         updateValue("uColor3", params.color3);
         if (params.map) {
            updateValue("uMap", params.map);
            updateValue("uIsMap", true);
         } else if (params.map === false) {
            updateValue("uIsMap", false);
         }
         if (params.alphaMap) {
            updateValue("uAlphaMap", params.alphaMap);
            updateValue("uIsAlphaMap", true);
         } else if (params.alphaMap === false) {
            updateValue("uIsAlphaMap", false);
         }
         updateValue("uWobbleStrength", params.wobbleStrength);
         updateValue(
            "uWobblePositionFrequency",
            params.wobblePositionFrequency
         );
         updateValue("uWobbleTimeFrequency", params.wobbleTimeFrequency);
         updateValue("uWarpStrength", params.warpStrength);
         updateValue("uWarpPositionFrequency", params.warpPositionFrequency);
         updateValue("uWarpTimeFrequency", params.warpTimeFrequency);
         if (params.displacement) {
            updateValue("uDisplacement", params.displacement);
            updateValue("uIsDisplacement", true);
         } else if (params.displacement === false) {
            updateValue("uIsDisplacement", false);
         }
         updateValue("uDisplacementIntensity", params.displacementIntensity);
         updateValue(
            "uDisplacementColorIntensity",
            params.displacementColorIntensity
         );
         updateValue("uSizeRandomIntensity", params.sizeRandomIntensity);
         updateValue(
            "uSizeRandomTimeFrequency",
            params.sizeRandomTimeFrequency
         );
         updateValue("uSizeRandomMin", params.sizeRandomMin);
         updateValue("uSizeRandomMax", params.sizeRandomMax);
         updateValue("uDivergence", params.divergence);
         updateValue("uDivergencePoint", params.divergencePoint);
      },
      [updateValue]
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
