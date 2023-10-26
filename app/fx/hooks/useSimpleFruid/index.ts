import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { usePointer } from "../utils/usePointer";
import { RootState } from "@react-three/fiber";
import { setUniform } from "../utils/setUniforms";

const CONFIG = {
   PRESSURE_ITERATIONS: 20,
};

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useSimpleFruid = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const [materials, setMeshMaterial] = useMesh(scene);
   const camera = useCamera();
   const updatePointer = usePointer();
   const updateRenderTarget = useDoubleFBO(scene, camera);

   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState) => {
         const { gl, pointer } = props;

         // update divergence(発散)
         updateRenderTarget(gl, ({ read }) => {
            setMeshMaterial(materials.divergenceMaterial);
            setUniform(materials.divergenceMaterial, "dataTex", read);
         });

         // update pressure(圧力)
         const solverIteration = CONFIG.PRESSURE_ITERATIONS;
         for (let i = 0; i < solverIteration; i++) {
            updateRenderTarget(gl, ({ read }) => {
               setMeshMaterial(materials.pressureMaterial);
               setUniform(materials.pressureMaterial, "dataTex", read);
            });
         }

         // update velocity(速度)
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

         // update advection(移流)
         const outPutTexture = updateRenderTarget(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            setUniform(materials.advectionMaterial, "dataTex", read);
         });

         // return final texture
         return outPutTexture;
      },
      [materials, setMeshMaterial, updatePointer, updateRenderTarget]
   );
   return handleUpdate;
};
