import * as THREE from "three";
import { Size, RootState } from "@react-three/fiber";
import { useCreateObject } from "./utils/useCreateObject";
import { useMaterial } from "./utils/useMaterial";
import { MorphParticlesParams } from ".";
import { setUniform } from "../../../utils/setUniforms";
import { useCallback, useMemo } from "react";
import { Create3DHooksProps } from "../types";

export type UseCreateMorphParticlesProps = {
   size: Size;
   dpr: number;
   /** default : THREE.SphereGeometry(1, 32, 32) */
   geometry?: THREE.BufferGeometry;
   positions?: Float32Array[];
   uvs?: Float32Array[];
};

type UpdateUniform = (
   props: RootState | null,
   params?: MorphParticlesParams
) => void;
type UseCreateMorphParticlesReturn = [
   UpdateUniform,
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
   geometry,
   positions,
   uvs,
}: Create3DHooksProps &
   UseCreateMorphParticlesProps): UseCreateMorphParticlesReturn => {
   const morphGeometry = useMemo(
      () => geometry || new THREE.SphereGeometry(1, 32, 32),
      [geometry]
   );

   const material = useMaterial({ size, dpr });
   const {
      object: points,
      interactiveMesh,
      positions: generatedPositions,
      uvs: generatedUvs,
   } = useCreateObject({
      scene,
      geometry: morphGeometry,
      material,
      positions,
      uvs,
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
         setUniform(material, "uColor0", params.color0);
         setUniform(material, "uColor1", params.color1);
         setUniform(material, "uColor2", params.color2);
         setUniform(material, "uColor3", params.color3);
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
         } else {
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
      },
      [material]
   );

   return [
      updateUniform,
      {
         points,
         interactiveMesh,
         positions: generatedPositions,
         uvs: generatedUvs,
      },
   ];
};
