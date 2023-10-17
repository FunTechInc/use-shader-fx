import * as THREE from "three";
import { useCallback, useEffect, useMemo } from "react";
import { useInitialMaterial } from "./materials/useInitialMaterial";
import {
   AdvectionMaterial,
   useAdvectionMaterial,
} from "./materials/useAdvectionMaterial";
import {
   DivergenceMaterial,
   useDivergenceMaterial,
} from "./materials/useDivergenceMaterial";
import {
   PressureMaterial,
   usePressureMaterial,
} from "./materials/usePressureMaterial";
import { CurlMaterial, useCurlMaterial } from "./materials/useCurlMaterial";
import {
   VorticityMaterial,
   useVorticityMaterial,
} from "./materials/useVorticityMaterial";
import { useResolution } from "../utils/useResolution";
import { ClearMaterial, useClearMaterial } from "./materials/useClearMaterial";
import {
   GradientSubtractMaterial,
   useGradientSubtractMaterial,
} from "./materials/useGradientSubtractMaterial";
import { SplatMaterial, useSplateMaterial } from "./materials/useSplatMaterial";

type TMaterials =
   | AdvectionMaterial
   | DivergenceMaterial
   | CurlMaterial
   | PressureMaterial
   | ClearMaterial
   | GradientSubtractMaterial
   | SplatMaterial;
type TUseMeshReturnType = [
   {
      vorticityMaterial: VorticityMaterial;
      curlMaterial: CurlMaterial;
      advectionMaterial: AdvectionMaterial;
      divergenceMaterial: DivergenceMaterial;
      pressureMaterial: PressureMaterial;
      clearMaterial: ClearMaterial;
      gradientSubtractMaterial: GradientSubtractMaterial;
      splatMaterial: SplatMaterial;
   },
   (material: TMaterials) => void
];

export const useMesh = (scene: THREE.Scene): TUseMeshReturnType => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

   /*===============================================
	各シェーダーマテリアルの初期化
	===============================================*/
   //初期シェーダー(initial)
   const initialMaterial = useInitialMaterial();
   //更新用シェーダー
   const updateMaterial = initialMaterial.clone();
   //カールシェーダー (curl)
   const curlMaterial = useCurlMaterial();
   //うずまきシェーダー (vorticity)
   const vorticityMaterial = useVorticityMaterial();
   //移流シェーダー(advection)
   const advectionMaterial = useAdvectionMaterial();
   //発散シェーダー(divergence)
   const divergenceMaterial = useDivergenceMaterial();
   //圧力シェーダー(pressure)
   const pressureMaterial = usePressureMaterial();
   //クリアシェーダー
   const clearMaterial = useClearMaterial();
   //gradientSubtract
   const gradientSubtractMaterial = useGradientSubtractMaterial();
   //splatシェーダー
   const splatMaterial = useSplateMaterial();
   //set object
   const materials = useMemo(
      () => ({
         vorticityMaterial,
         curlMaterial,
         advectionMaterial,
         divergenceMaterial,
         pressureMaterial,
         clearMaterial,
         gradientSubtractMaterial,
         splatMaterial,
      }),
      [
         vorticityMaterial,
         curlMaterial,
         advectionMaterial,
         divergenceMaterial,
         pressureMaterial,
         clearMaterial,
         gradientSubtractMaterial,
         splatMaterial,
      ]
   );

   /*===============================================
	resize
	===============================================*/
   const resolution = useResolution();
   useEffect(() => {
      for (const material of Object.values(materials)) {
         material.uniforms.texelSize.value = new THREE.Vector2(
            1.0 / resolution.x,
            1.0 / resolution.y
         );
      }
   }, [materials, resolution]);

   /*===============================================
	add mesh to scene
	===============================================*/
   const mesh = useMemo(
      () => new THREE.Mesh(geometry, initialMaterial),
      [geometry, initialMaterial]
   );
   scene.add(mesh);
   initialMaterial.dispose();
   mesh.material = updateMaterial;

   /*===============================================
	マテリアルの更新関数
	===============================================*/
   const setMeshMaterial = useCallback(
      (material: TMaterials) => {
         mesh.material = material;
         mesh.material.needsUpdate = true;
      },
      [mesh]
   );

   return [materials, setMeshMaterial];
};
