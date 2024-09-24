import { useMemo } from "react";
import * as THREE from "three";
import { useObject3D } from "./useObject3D";
import { Size } from "../fxs/types";
import { useResolution } from "./useResolution";
import { FxMaterial, FxMaterialProps } from "../fxs/materials/FxMaterial";

type MaterialConstructor<M> = new (props: FxMaterialProps) => M;

type GeometryConstructor = new (
   width: number,
   height: number
) => THREE.BufferGeometry;

export const useScene = <M extends FxMaterial>({
   size,
   dpr,
   material,
   geometry = THREE.PlaneGeometry,
   geometrySize,
   ...materialProps
}: {
   size: Size;
   dpr: number | false;
   material: MaterialConstructor<M>;
   geometry?: GeometryConstructor;
   geometrySize?: {
      width: number;
      height: number;
   };
} & FxMaterialProps) => {
   const scene = useMemo(() => new THREE.Scene(), []);

   const _geometry = useMemo(
      () => new geometry(geometrySize?.width || 2, geometrySize?.height || 2),
      [geometry, geometrySize]
   );

   const _material = useMemo(
      () => new material(materialProps),
      [material, materialProps]
   );

   const resolution = useResolution(size, dpr);
   _material.updateResolution(resolution);

   useObject3D(scene, _geometry, _material, THREE.Mesh);

   return {
      scene,
      material: _material,
   };
};
