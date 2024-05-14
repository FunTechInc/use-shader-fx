import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { mergeVertices } from "three-stdlib";
import {
   useMaterial,
   Wobble3DMaterial,
   WobbleMaterialProps,
   WobbleMaterialConstructor,
} from "./useMaterial";
import { Wobble3DParams } from ".";
import {
   setUniform,
   setCustomUniform,
   CustomParams,
} from "../../../utils/setUniforms";
import { useCallback, useMemo } from "react";
import { useAddObject } from "../../../utils/useAddObject";
import { Create3DHooksProps } from "../types";

export type UseCreateWobble3DProps = {
   /** default : `THREE.IcosahedronGeometry(2,20)` */
   geometry?: THREE.BufferGeometry;
};

type UpdateUniform = (
   rootState: RootState | null,
   newParams?: Wobble3DParams,
   customParams?: CustomParams
) => void;

type UseCreateWobble3DReturn<T> = [
   UpdateUniform,
   {
      mesh: THREE.Mesh;
      depthMaterial: THREE.MeshDepthMaterial;
   }
];

export const useCreateWobble3D = <T extends WobbleMaterialConstructor>({
   scene = false,
   geometry,
   isCustomTransmission,
   baseMaterial,
   materialParameters,
   onBeforeInit,
   depthOnBeforeInit,
}: UseCreateWobble3DProps &
   Create3DHooksProps &
   WobbleMaterialProps<T>): UseCreateWobble3DReturn<T> => {
   const wobbleGeometry = useMemo(() => {
      let geo = geometry || new THREE.IcosahedronGeometry(2, 20);
      geo = mergeVertices(geo);
      geo.computeTangents();
      return geo;
   }, [geometry]);
   const { material, depthMaterial } = useMaterial({
      baseMaterial,
      materialParameters,
      isCustomTransmission,
      onBeforeInit,
      depthOnBeforeInit,
   });

   const mesh = useAddObject(scene, wobbleGeometry, material, THREE.Mesh);

   const userData = material.userData as Wobble3DMaterial;
   const updateValue = setUniform(userData);
   const updateCustomValue = setCustomUniform(userData);

   const updateUniform = useCallback<UpdateUniform>(
      (rootState, newParams, customParams) => {
         if (rootState) {
            updateValue(
               "uTime",
               newParams?.beat || rootState.clock.getElapsedTime()
            );
         }
         if (newParams === undefined) {
            return;
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
         updateValue("uColor0", newParams.color0);
         updateValue("uColor1", newParams.color1);
         updateValue("uColor2", newParams.color2);
         updateValue("uColor3", newParams.color3);
         updateValue("uColorMix", newParams.colorMix);
         updateValue("uEdgeThreshold", newParams.edgeThreshold);
         updateValue("uEdgeColor", newParams.edgeColor);
         updateValue("uChromaticAberration", newParams.chromaticAberration);
         updateValue("uAnisotropicBlur", newParams.anisotropicBlur);
         updateValue("uDistortion", newParams.distortion);
         updateValue("uDistortionScale", newParams.distortionScale);
         updateValue("uRefractionSamples", newParams.refractionSamples);
         updateValue("uTemporalDistortion", newParams.temporalDistortion);

         updateCustomValue(customParams);
      },
      [updateValue, updateCustomValue]
   );

   return [
      updateUniform,
      {
         mesh,
         depthMaterial,
      },
   ];
};
