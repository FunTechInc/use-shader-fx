import * as THREE from "three";
import { useCallback, useEffect, useMemo } from "react";
import { useInitialMaterial } from "./materials/useInitialMaterial";
import {
   VelocityMaterial,
   useVelocityMaterial,
} from "./materials/useVelocityMaterial";
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
import { useThree } from "@react-three/fiber";

type TMaterials =
   | VelocityMaterial
   | AdvectionMaterial
   | DivergenceMaterial
   | CurlMaterial
   | PressureMaterial;
type TUseMeshReturnType = [
   {
      velocityMaterial: VelocityMaterial;
      vorticityMaterial: VorticityMaterial;
      curlMaterial: CurlMaterial;
      advectionMaterial: AdvectionMaterial;
      divergenceMaterial: DivergenceMaterial;
      pressureMaterial: PressureMaterial;
   },
   (material: TMaterials) => void
];

export const useMesh = (scene: THREE.Scene): TUseMeshReturnType => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const size = useThree((state) => state.size);
   const resolution = useMemo(
      () => new THREE.Vector2(size.width, size.height),
      [size]
   );
   /*===============================================
	各シェーダーマテリアルの初期化
	===============================================*/
   //初期シェーダー(initial)
   const initialMaterial = useInitialMaterial();
   //更新用シェーダー
   const updateMaterial = initialMaterial.clone();
   //速度シェーダー（velocity）
   const velocityMaterial = useVelocityMaterial();
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
   //set object
   const materials = useMemo(
      () => ({
         velocityMaterial,
         vorticityMaterial,
         curlMaterial,
         advectionMaterial,
         divergenceMaterial,
         pressureMaterial,
      }),
      [
         velocityMaterial,
         vorticityMaterial,
         curlMaterial,
         advectionMaterial,
         divergenceMaterial,
         pressureMaterial,
      ]
   );
   /*===============================================
	resize
	===============================================*/
   useEffect(() => {
      for (const material of Object.values(materials)) {
         material.uniforms.resolution.value = resolution;
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
