import * as THREE from "three";
import { SimpleFruidMaterials, useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { usePointer } from "../utils/usePointer";
import { RootState, Size } from "@react-three/fiber";
import { setUniform } from "../utils/setUniforms";
import { useParams } from "../utils/useParams";
import { HooksReturn } from "../types";
import { DoubleRenderTarget } from "../utils/types";

export type SimpleFruidParams = {
   /** 圧力のヤコビ法の計算回数 */
   pressure_iterations?: number;
   /** 圧力のステップごとの減衰値 */
   attenuation?: number;
   /** 圧力計算時の係数 */
   alpha?: number;
   /** 圧力計算時の係数 */
   beta?: number;
   /** 粘度 */
   viscosity?: number;
   /** 力を加える円の半径 */
   forceRadius?: number;
   /** 速度の係数 */
   forceCoefficient?: number;
};

export type SimpleFruidObject = {
   scene: THREE.Scene;
   materials: SimpleFruidMaterials;
   camera: THREE.Camera;
   renderTarget: DoubleRenderTarget;
};

export const useSimpleFruid = ({
   size,
}: {
   size: Size;
}): HooksReturn<SimpleFruidParams, SimpleFruidObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const [materials, setMeshMaterial] = useMesh({ scene, size });
   const camera = useCamera(size);
   const updatePointer = usePointer();

   const [renderTarget, updateRenderTarget] = useDoubleFBO({
      scene,
      camera,
      size,
      isSizeUpdate: true,
   });

   const [params, setParams] = useParams<SimpleFruidParams>({
      pressure_iterations: 20,
      attenuation: 1.0,
      alpha: 1.0,
      beta: 1.0,
      viscosity: 0.99,
      forceRadius: 90,
      forceCoefficient: 1.0,
   });

   const updateFx = useCallback(
      (props: RootState, updateParams: SimpleFruidParams) => {
         const { gl, pointer } = props;

         setParams(updateParams);

         setUniform(
            materials.advectionMaterial,
            "attenuation",
            params.attenuation!
         );
         setUniform(materials.pressureMaterial, "alpha", params.alpha!);
         setUniform(materials.pressureMaterial, "beta", params.beta!);
         setUniform(materials.velocityMaterial, "viscosity", params.viscosity!);
         setUniform(
            materials.velocityMaterial,
            "forceRadius",
            params.forceRadius!
         );
         setUniform(
            materials.velocityMaterial,
            "forceCoefficient",
            params.forceCoefficient!
         );

         // update divergence
         updateRenderTarget(gl, ({ read }) => {
            setMeshMaterial(materials.divergenceMaterial);
            setUniform(materials.divergenceMaterial, "dataTex", read);
         });

         // update pressure
         const solverIteration = params.pressure_iterations!;
         for (let i = 0; i < solverIteration; i++) {
            updateRenderTarget(gl, ({ read }) => {
               setMeshMaterial(materials.pressureMaterial);
               setUniform(materials.pressureMaterial, "dataTex", read);
            });
         }

         // update velocity
         const { currentPointer, prevPointer } = updatePointer(pointer);
         setUniform(materials.velocityMaterial, "pointerPos", currentPointer);
         setUniform(
            materials.velocityMaterial,
            "beforePointerPos",
            prevPointer
         );
         updateRenderTarget(gl, ({ read }) => {
            setMeshMaterial(materials.velocityMaterial);
            setUniform(materials.velocityMaterial, "dataTex", read);
         });

         // update advection
         const outPutTexture = updateRenderTarget(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            setUniform(materials.advectionMaterial, "dataTex", read);
         });

         return outPutTexture;
      },
      [
         materials,
         setMeshMaterial,
         updatePointer,
         updateRenderTarget,
         setParams,
         params,
      ]
   );
   return {
      updateFx,
      setParams,
      fxObject: {
         scene: scene,
         materials: materials,
         camera: camera,
         renderTarget: renderTarget,
      },
   };
};
