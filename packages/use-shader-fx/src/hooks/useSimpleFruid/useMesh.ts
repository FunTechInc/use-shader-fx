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
import { useResolution } from "../../utils/useResolution";
import { useAddMesh } from "../../utils/useAddMesh";
import { setUniform } from "../../utils/setUniforms";
import { Size } from "@react-three/fiber";

type TMaterials =
   | VelocityMaterial
   | AdvectionMaterial
   | DivergenceMaterial
   | PressureMaterial;

export type SimpleFruidMaterials = {
   velocityMaterial: VelocityMaterial;
   advectionMaterial: AdvectionMaterial;
   divergenceMaterial: DivergenceMaterial;
   pressureMaterial: PressureMaterial;
};

type TUseMeshReturnType = [
   SimpleFruidMaterials,
   (material: TMaterials) => void
];

export const useMesh = ({
   scene,
   size,
   dpr,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number;
}): TUseMeshReturnType => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const initialMaterial = useInitialMaterial();
   const updateMaterial = initialMaterial.clone();
   const velocityMaterial = useVelocityMaterial();
   const advectionMaterial = useAdvectionMaterial();
   const divergenceMaterial = useDivergenceMaterial();
   const pressureMaterial = usePressureMaterial();
   const materials = useMemo(
      () => ({
         velocityMaterial,
         advectionMaterial,
         divergenceMaterial,
         pressureMaterial,
      }),
      [
         velocityMaterial,
         advectionMaterial,
         divergenceMaterial,
         pressureMaterial,
      ]
   );

   const resolution = useResolution(size, dpr);
   useEffect(() => {
      for (const material of Object.values(materials)) {
         setUniform(material, "resolution", resolution);
      }
   }, [resolution, materials]);

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
