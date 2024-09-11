import * as THREE from "three/webgpu";
import { useCallback, useEffect, useMemo } from "react";
import {
   AdvectionNodeMaterial,
   ClearNodeMaterial,
   CurlNodeMaterial,
   DivergenceNodeMaterial,
   GradientSubtractNodeMaterial,
   initialNodeMaterial,
   PressureNodeMaterial,
   SplatNodeMaterial,
   VorticityNodeMaterial,
} from "./materials";
import { useResolution } from "../../utils/useResolution";
import { Size } from "../types";
import { useAddObject } from "../../utils/useAddObject";

type Materials =
   | AdvectionNodeMaterial
   | DivergenceNodeMaterial
   | CurlNodeMaterial
   | PressureNodeMaterial
   | ClearNodeMaterial
   | GradientSubtractNodeMaterial
   | SplatNodeMaterial;

/*===============================================
return { materials, setMeshMaterial, mesh };
- materialsをつくる
- resolutionの更新
- meshに追加
- materialのdispose周り
- setMeshMaterialの追加
===============================================*/
export const useMaterials = ({
   scene,
   size,
   dpr,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number | false;
}) => {
   const materials = useMemo(() => {
      return {
         advectionMat: new AdvectionNodeMaterial(),
         clearMat: new ClearNodeMaterial(),
         curlMat: new CurlNodeMaterial(),
         divergenceMat: new DivergenceNodeMaterial(),
         gradientSubtractMat: new GradientSubtractNodeMaterial(),
         initialMat: new initialNodeMaterial(),
         pressureMat: new PressureNodeMaterial(),
         splatMat: new SplatNodeMaterial(),
         vorticityMat: new VorticityNodeMaterial(),
      };
   }, []);

   const resolution = useResolution(size, dpr);

   materials.splatMat.aspectRatio = resolution.x / resolution.y;
   const texelSize = new THREE.Vector2(1.0 / resolution.x, 1.0 / resolution.y);
   materials.advectionMat.texelSize = texelSize;
   materials.curlMat.texelSize = texelSize;
   materials.divergenceMat.texelSize = texelSize;
   materials.gradientSubtractMat.texelSize = texelSize;
   materials.pressureMat.texelSize = texelSize;
   materials.vorticityMat.texelSize = texelSize;

   // mesh
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const mesh = useAddObject(scene, geometry, materials.initialMat, THREE.Mesh);

   // TODO*これどういう意味？
   useMemo(() => {
      const updateMat = materials.initialMat.clone();
      materials.initialMat.dispose();
      mesh.material = updateMat;
   }, [materials.initialMat, mesh]);

   // dispose
   useEffect(() => {
      return () => {
         for (const material of Object.values(materials)) {
            material.dispose();
         }
      };
   }, [materials]);

   const setMaterial = useCallback(
      (material: Materials) => {
         mesh.material = material;
         mesh.material.needsUpdate = true;
      },
      [mesh]
   );

   return { materials, setMaterial };
};
