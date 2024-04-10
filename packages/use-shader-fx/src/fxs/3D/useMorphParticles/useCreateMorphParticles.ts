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
   });

   const { points, interactiveMesh } = useCreateObject({
      scene,
      geometry: morphGeometry,
      material,
   });

   const updateUniform = useCallback<UpdateUniform>(
      (props, params) => {
         if (props) {
            setUniform(
               material,
               "uTime",
               params?.beat || props.clock.getElapsedTime()
            );
         }
         if (params === undefined) {
            return;
         }
         setUniform(material, "uMorphProgress", params.morphProgress);
         setUniform(material, "uBlurAlpha", params.blurAlpha);
         setUniform(material, "uBlurRadius", params.blurRadius);
         setUniform(material, "uPointSize", params.pointSize);
         setUniform(material, "uPointAlpha", params.pointAlpha);
         if (params.picture) {
            setUniform(material, "uPicture", params.picture);
            setUniform(material, "uIsPicture", true);
         } else if (params.picture === false) {
            setUniform(material, "uIsPicture", false);
         }
         if (params.alphaPicture) {
            setUniform(material, "uAlphaPicture", params.alphaPicture);
            setUniform(material, "uIsAlphaPicture", true);
         } else if (params.alphaPicture === false) {
            setUniform(material, "uIsAlphaPicture", false);
         }
         setUniform(material, "uColor0", params.color0);
         setUniform(material, "uColor1", params.color1);
         setUniform(material, "uColor2", params.color2);
         setUniform(material, "uColor3", params.color3);
         if (params.map) {
            setUniform(material, "uMap", params.map);
            setUniform(material, "uIsMap", true);
         } else if (params.map === false) {
            setUniform(material, "uIsMap", false);
         }
         if (params.alphaMap) {
            setUniform(material, "uAlphaMap", params.alphaMap);
            setUniform(material, "uIsAlphaMap", true);
         } else if (params.alphaMap === false) {
            setUniform(material, "uIsAlphaMap", false);
         }
         setUniform(material, "uWobbleStrength", params.wobbleStrength);
         setUniform(
            material,
            "uWobblePositionFrequency",
            params.wobblePositionFrequency
         );
         setUniform(
            material,
            "uWobbleTimeFrequency",
            params.wobbleTimeFrequency
         );
         setUniform(material, "uWarpStrength", params.warpStrength);
         setUniform(
            material,
            "uWarpPositionFrequency",
            params.warpPositionFrequency
         );
         setUniform(material, "uWarpTimeFrequency", params.warpTimeFrequency);
         if (params.displacement) {
            setUniform(material, "uDisplacement", params.displacement);
            setUniform(material, "uIsDisplacement", true);
         } else if (params.displacement === false) {
            setUniform(material, "uIsDisplacement", false);
         }
         setUniform(
            material,
            "uDisplacementIntensity",
            params.displacementIntensity
         );
         setUniform(
            material,
            "uDisplacementColorIntensity",
            params.displacementColorIntensity
         );
         setUniform(
            material,
            "uSizeRandomIntensity",
            params.sizeRandomIntensity
         );
         setUniform(
            material,
            "uSizeRandomTimeFrequency",
            params.sizeRandomTimeFrequency
         );
         setUniform(material, "uSizeRandomMin", params.sizeRandomMin);
         setUniform(material, "uSizeRandomMax", params.sizeRandomMax);
         setUniform(material, "uDivergence", params.divergence);
         setUniform(material, "uDivergencePoint", params.divergencePoint);
      },
      [material]
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
