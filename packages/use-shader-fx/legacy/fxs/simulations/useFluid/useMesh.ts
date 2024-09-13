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
import { useResolution } from "../../../utils/useResolution";
import { ClearMaterial, useClearMaterial } from "./materials/useClearMaterial";
import {
   GradientSubtractMaterial,
   useGradientSubtractMaterial,
} from "./materials/useGradientSubtractMaterial";
import { SplatMaterial, useSplatMaterial } from "./materials/useSplatMaterial";
import { CustomParams, setUniform } from "../../../utils/setUniforms";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps, Size } from "../../types";

type TMaterials =
   | AdvectionMaterial
   | DivergenceMaterial
   | CurlMaterial
   | PressureMaterial
   | ClearMaterial
   | GradientSubtractMaterial
   | SplatMaterial;

export type FluidMaterials = {
   vorticityMaterial: VorticityMaterial;
   curlMaterial: CurlMaterial;
   advectionMaterial: AdvectionMaterial;
   divergenceMaterial: DivergenceMaterial;
   pressureMaterial: PressureMaterial;
   clearMaterial: ClearMaterial;
   gradientSubtractMaterial: GradientSubtractMaterial;
   splatMaterial: SplatMaterial;
};

export type CustomizableKeys =
   | "advection"
   | "splat"
   | "curl"
   | "vorticity"
   | "divergence"
   | "clear"
   | "pressure"
   | "gradientSubtract";

export type CustomFluidProps = {
   [K in CustomizableKeys]?: MaterialProps;
};
export type CustomFluidParams = {
   [K in CustomizableKeys]?: CustomParams;
};

const useCustomMaterial = <T extends THREE.Material>(
   materialHook: (materialProps: MaterialProps) => T,
   materialProps?: MaterialProps
) => {
   return materialHook(materialProps ?? {});
};

/**
 * Returns the material update function in the second argument
 */
export const useMesh = ({
   scene,
   size,
   dpr,
   customFluidProps,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number | false;
   customFluidProps?: CustomFluidProps;
}) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

   const {
      curl,
      vorticity,
      advection,
      divergence,
      pressure,
      clear,
      gradientSubtract,
      splat,
   } = customFluidProps ?? {};

   const initialMaterial = useCustomMaterial(useInitialMaterial);
   const updateMaterial = initialMaterial.clone();
   const curlMaterial = useCustomMaterial(useCurlMaterial, curl);
   const vorticityMaterial = useCustomMaterial(useVorticityMaterial, vorticity);
   const advectionMaterial = useCustomMaterial(useAdvectionMaterial, advection);
   const divergenceMaterial = useCustomMaterial(
      useDivergenceMaterial,
      divergence
   );
   const pressureMaterial = useCustomMaterial(usePressureMaterial, pressure);
   const clearMaterial = useCustomMaterial(useClearMaterial, clear);
   const gradientSubtractMaterial = useCustomMaterial(
      useGradientSubtractMaterial,
      gradientSubtract
   );
   const splatMaterial = useCustomMaterial(useSplatMaterial, splat);
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

   const resolution = useResolution(size, dpr);
   useMemo(() => {
      setUniform(materials.splatMaterial)(
         "aspectRatio",
         resolution.x / resolution.y
      );
      for (const material of Object.values(materials)) {
         setUniform<typeof material.uniforms>(material)(
            "texelSize",
            new THREE.Vector2(1.0 / resolution.x, 1.0 / resolution.y)
         );
      }
   }, [resolution, materials]);

   const mesh = useAddObject(scene, geometry, initialMaterial, THREE.Mesh);

   useMemo(() => {
      initialMaterial.dispose();
      mesh.material = updateMaterial;
   }, [initialMaterial, mesh, updateMaterial]);

   useEffect(() => {
      return () => {
         for (const material of Object.values(materials)) {
            material.dispose();
         }
      };
   }, [materials]);

   const setMeshMaterial = useCallback(
      (material: TMaterials) => {
         mesh.material = material;
         mesh.material.needsUpdate = true;
      },
      [mesh]
   );

   return { materials, setMeshMaterial, mesh };
};
