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
   });

   const mesh = useAddObject(scene, wobbleGeometry, material, THREE.Mesh);

   const updateUniform = useCallback<UpdateUniform>(
      (props, params) => {
         const userData = material.userData as Wobble3DMaterial;
         if (props) {
            setUniform(
               userData,
               "uTime",
               params?.beat || props.clock.getElapsedTime()
            );
         }
         if (params === undefined) {
            return;
         }
         setUniform(userData, "uWobbleStrength", params.wobbleStrength);
         setUniform(
            userData,
            "uWobblePositionFrequency",
            params.wobblePositionFrequency
         );
         setUniform(
            userData,
            "uWobbleTimeFrequency",
            params.wobbleTimeFrequency
         );
         setUniform(userData, "uWarpStrength", params.warpStrength);
         setUniform(
            userData,
            "uWarpPositionFrequency",
            params.warpPositionFrequency
         );
         setUniform(userData, "uWarpTimeFrequency", params.warpTimeFrequency);
         setUniform(userData, "uWobbleShine", params.wobbleShine);
         setUniform(userData, "uSamples", params.samples);
         setUniform(userData, "uColor0", params.color0);
         setUniform(userData, "uColor1", params.color1);
         setUniform(userData, "uColor2", params.color2);
         setUniform(userData, "uColor3", params.color3);
         setUniform(userData, "uColorMix", params.colorMix);
         setUniform(
            userData,
            "uChromaticAberration",
            params.chromaticAberration
         );
         setUniform(userData, "uAnisotropicBlur", params.anisotropicBlur);
         setUniform(userData, "uDistortion", params.distortion);
         setUniform(userData, "uDistortionScale", params.distortionScale);
         setUniform(userData, "uTemporalDistortion", params.temporalDistortion);
      },
      [material]
   );

   return [
      updateUniform,
      {
         mesh,
         depthMaterial,
      },
   ];
};
