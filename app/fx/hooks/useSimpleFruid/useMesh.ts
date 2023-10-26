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
import { useResolution } from "../utils/useResolution";
import { useAddMesh } from "../utils/useAddMesh";
import { setUniform } from "../utils/setUniforms";

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

   const resolution = useResolution();
   for (const material of Object.values(materials)) {
      setUniform(material, "resolution", resolution.clone());
   }

   const mesh = useAddMesh(scene, geometry, initialMaterial);
   useEffect(() => {
      initialMaterial.dispose();
      mesh.material = updateMaterial;
   }, [initialMaterial, mesh, updateMaterial]);

   const setMeshMaterial = useCallback(
      (material: TMaterials) => {
         mesh.material = material;
         mesh.material.needsUpdate = true;
      },
      [mesh]
   );

   return [materials, setMeshMaterial];
};
