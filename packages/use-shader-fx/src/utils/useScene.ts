import { useMemo } from "react";
import * as THREE from "three";
import { useObject3D } from "./useObject3D";

type MaterialConstructor<M extends THREE.ShaderMaterial> = new (
   uniformValues?: any,
   materialParameters?: THREE.ShaderMaterialParameters
) => M;
type GeometryConstructor = new (
   width: number,
   height: number
) => THREE.BufferGeometry;

export const useScene = <M extends THREE.ShaderMaterial>({
   material,
   uniformValues,
   materialParameters,
   geometry = THREE.PlaneGeometry,
   geometrySize,
}: {
   material: MaterialConstructor<M>;
   uniformValues?: any;
   materialParameters?: THREE.ShaderMaterialParameters;
   geometry?: GeometryConstructor;
   geometrySize?: {
      width: number;
      height: number;
   };
}) => {
   const scene = useMemo(() => new THREE.Scene(), []);

   const _geometry = useMemo(
      () => new geometry(geometrySize?.width || 2, geometrySize?.height || 2),
      [geometry, geometrySize]
   );

   const _material = useMemo(
      () => new material(uniformValues, materialParameters),
      [material, uniformValues, materialParameters]
   );

   useObject3D(scene, _geometry, _material, THREE.Mesh);

   return {
      scene,
      material: _material,
   };
};
