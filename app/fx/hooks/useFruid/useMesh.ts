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
import { useAddMesh } from "../utils/useAddMesh";
import { setUniform } from "../utils/setUniforms";

type TMaterials =
   | AdvectionMaterial
   | DivergenceMaterial
   | CurlMaterial
   | PressureMaterial
   | ClearMaterial
   | GradientSubtractMaterial
   | SplatMaterial;

export type FruidMaterials = {
   vorticityMaterial: VorticityMaterial;
   curlMaterial: CurlMaterial;
   advectionMaterial: AdvectionMaterial;
   divergenceMaterial: DivergenceMaterial;
   pressureMaterial: PressureMaterial;
   clearMaterial: ClearMaterial;
   gradientSubtractMaterial: GradientSubtractMaterial;
   splatMaterial: SplatMaterial;
};
type TUseMeshReturnType = [FruidMaterials, (material: TMaterials) => void];

/**
 * Returns the material update function in the second argument
 */
export const useMesh = (scene: THREE.Scene): TUseMeshReturnType => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const initialMaterial = useInitialMaterial();
   const updateMaterial = initialMaterial.clone();
   const curlMaterial = useCurlMaterial();
   const vorticityMaterial = useVorticityMaterial();
   const advectionMaterial = useAdvectionMaterial();
   const divergenceMaterial = useDivergenceMaterial();
   const pressureMaterial = usePressureMaterial();
   const clearMaterial = useClearMaterial();
   const gradientSubtractMaterial = useGradientSubtractMaterial();
   const splatMaterial = useSplateMaterial();
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

   const resolution = useResolution();
   for (const material of Object.values(materials)) {
      setUniform(
         material,
         "texelSize",
         new THREE.Vector2(1.0 / resolution.x, 1.0 / resolution.y)
      );
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
