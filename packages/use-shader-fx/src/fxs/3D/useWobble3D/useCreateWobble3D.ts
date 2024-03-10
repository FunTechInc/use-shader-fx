import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { mergeVertices } from "three-stdlib";
import {
   useMaterial,
   Wobble3DMaterial,
   WobbleMaterialProps,
   WobbleMaterialConstructor,
} from "./useMaterial";
import { Wobble3DParams, WOBBLE3D_PARAMS } from ".";
import { setUniform } from "../../../utils/setUniforms";
import { useCallback, useEffect, useMemo } from "react";
import { useAddObject } from "../../../utils/useAddObject";
import { Create3DHooksProps } from "../types";

export type UseCreateWobble3DProps = {
   /** default : THREE.IcosahedronGeometry(2,50) */
   geometry?: THREE.BufferGeometry;
};

type UseCreateWobble3DReturn = [
   (props: RootState | null, params: Wobble3DParams) => void,
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
   WobbleMaterialProps<T>): UseCreateWobble3DReturn => {
   const wobbleGeometry = useMemo(() => {
      let geo = geometry || new THREE.IcosahedronGeometry(2, 50);
      geo = mergeVertices(geo);
      geo.computeTangents();
      return geo;
   }, [geometry]);
   const { material, depthMaterial } = useMaterial({
      baseMaterial,
      materialParameters,
   });

   const object = useAddObject(
      scene,
      wobbleGeometry,
      material,
      THREE.Mesh
   ) as THREE.Mesh;

   const updateUniform = useCallback(
      (props: RootState | null, params: Wobble3DParams) => {
         const newParams = { ...WOBBLE3D_PARAMS, ...params };
         const userData = material.userData as Wobble3DMaterial;

         if (props) {
            setUniform(
               userData,
               "uTime",
               newParams.beat || props.clock.getElapsedTime()
            );
         }
         setUniform(userData, "uWobbleStrength", newParams.wobbleStrength!);
         setUniform(
            userData,
            "uWobblePositionFrequency",
            newParams.wobblePositionFrequency!
         );
         setUniform(
            userData,
            "uWobbleTimeFrequency",
            newParams.wobbleTimeFrequency!
         );
         setUniform(userData, "uWarpStrength", newParams.warpStrength!);
         setUniform(
            userData,
            "uWarpPositionFrequency",
            newParams.warpPositionFrequency!
         );
         setUniform(
            userData,
            "uWarpTimeFrequency",
            newParams.warpTimeFrequency!
         );
         setUniform(userData, "uWobbleShine", newParams.wobbleShine!);
         setUniform(userData, "uSamples", newParams.samples!);
         setUniform(userData, "uColor0", newParams.color0!);
         setUniform(userData, "uColor1", newParams.color1!);
         setUniform(userData, "uColor2", newParams.color2!);
         setUniform(userData, "uColor3", newParams.color3!);
         setUniform(userData, "uColorMix", newParams.colorMix!);
         setUniform(
            userData,
            "uChromaticAberration",
            newParams.chromaticAberration!
         );
         setUniform(userData, "uAnisotropicBlur", newParams.anisotropicBlur!);
         setUniform(userData, "uDistortion", newParams.distortion!);
         setUniform(userData, "uDistortionScale", newParams.distortionScale!);
         setUniform(
            userData,
            "uTemporalDistortion",
            newParams.temporalDistortion!
         );
      },
      [material]
   );

   return [
      updateUniform,
      {
         mesh: object,
         depthMaterial,
      },
   ];
};
