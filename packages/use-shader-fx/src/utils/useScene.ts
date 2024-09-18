import { useMemo } from "react";
import * as THREE from "three";
import { useObject3D } from "./useObject3D";
import { useResolution } from "./useResolution";
import { Size } from "../fxs/types";

type MaterialConstructor<M extends THREE.ShaderMaterial> = new (
   uniformValues: any,
   materialParameters: THREE.MaterialParameters
) => M;
type GeometryConstructor = new (
   width: number,
   height: number
) => THREE.BufferGeometry;

export const useScene = <M extends THREE.ShaderMaterial>({
   size,
   material,
   uniformValues,
   materialParameters,
   fxBlending,
   geometry = THREE.PlaneGeometry,
   geometrySize = { width: 2, height: 2 },
}: {
   size: Size;
   material: MaterialConstructor<M>;
   uniformValues?: any;
   materialParameters?: THREE.MaterialParameters;
   fxBlending?: boolean;
   geometry?: GeometryConstructor;
   geometrySize?: {
      width: number;
      height: number;
   };
}) => {
   const scene = useMemo(() => new THREE.Scene(), []);

   const _geometry = useMemo(
      () => new geometry(geometrySize.width, geometrySize.height),
      [geometry, geometrySize]
   );

   const _material = useMemo(
      () =>
         new material(uniformValues, {
            ...materialParameters,
            ...(fxBlending !== undefined && { fxBlending }),
         }),
      [material, uniformValues, materialParameters, fxBlending]
   );

   const resolution = useResolution(size);
   _material.uniforms.resolution.value.copy(resolution);

   useObject3D(scene, _geometry, _material, THREE.Mesh);

   return {
      scene,
      material: _material,
   };
};
