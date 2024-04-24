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
import { setUniform } from "../../../utils/setUniforms";
import { useCallback, useMemo } from "react";
import { useAddObject } from "../../../utils/useAddObject";
import { Create3DHooksProps } from "../types";

export type UseCreateWobble3DProps = {
   /** default : `THREE.IcosahedronGeometry(2,20)` */
   geometry?: THREE.BufferGeometry;
};

type UpdateUniform = (props: RootState | null, params?: Wobble3DParams) => void;
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
   baseMaterial,
   materialParameters,
   onBeforeCompile,
   depthOnBeforeCompile,
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
      onBeforeCompile,
      depthOnBeforeCompile,
   });

   const mesh = useAddObject(scene, wobbleGeometry, material, THREE.Mesh);

   const userData = material.userData as Wobble3DMaterial;
   const updateValue = setUniform(userData);
   const updateUniform = useCallback<UpdateUniform>(
      (props, params) => {
         if (props) {
            updateValue("uTime", params?.beat || props.clock.getElapsedTime());
         }
         if (params === undefined) {
            return;
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
         updateValue("uWobbleShine", params.wobbleShine);
         if (params.wobbleMap) {
            updateValue("uWobbleMap", params.wobbleMap);
            updateValue("uIsWobbleMap", true);
         } else if (params.wobbleMap === false) {
            updateValue("uIsWobbleMap", false);
         }
         updateValue("uWobbleMapStrength", params.wobbleMapStrength);
         updateValue("uWobbleMapDistortion", params.wobbleMapDistortion);
         updateValue("uSamples", params.samples);
         updateValue("uColor0", params.color0);
         updateValue("uColor1", params.color1);
         updateValue("uColor2", params.color2);
         updateValue("uColor3", params.color3);
         updateValue("uColorMix", params.colorMix);
         updateValue("uChromaticAberration", params.chromaticAberration);
         updateValue("uAnisotropicBlur", params.anisotropicBlur);
         updateValue("uDistortion", params.distortion);
         updateValue("uDistortionScale", params.distortionScale);
         updateValue("uTemporalDistortion", params.temporalDistortion);
      },
      [updateValue]
   );

   return [
      updateUniform,
      {
         mesh,
         depthMaterial,
      },
   ];
};
