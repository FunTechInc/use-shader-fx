import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { usePointer } from "../utils/usePointer";
import { RootState } from "@react-three/fiber";
import { setUniform } from "../utils/setUniforms";

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useFruid = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const [materials, setMeshMaterial] = useMesh(scene);
   const camera = useCamera();
   const updatePointer = usePointer();

   //FBO
   const updateRenderTarget = useDoubleFBO(scene, camera);

   const unifroms = useMemo(
      () => ({
         divergence: materials.divergenceMaterial.uniforms,
         pressure: materials.pressureMaterial.uniforms,
         velocity: materials.velocityMaterial.uniforms,
         curl: materials.curlMaterial.uniforms,
         vorticity: materials.vorticityMaterial.uniforms,
         advection: materials.advectionMaterial.uniforms,
      }),
      [materials]
   );

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
         const solverIteration = 30; //TODO：これも変数化
         for (let i = 0; i < solverIteration; i++) {
            updateRenderTarget(gl, ({ read }) => {
               setMeshMaterial(materials.pressureMaterial);
               unifroms.pressure.dataTex.value = read;
            });
         }

         // update velocity(速度)
         const { currentPointer, prevPointer } = updatePointer(pointer);
         unifroms.velocity.pointerPos.value = currentPointer;
         unifroms.velocity.beforePointerPos.value = prevPointer;
         updateRenderTarget(gl, ({ read }) => {
            setMeshMaterial(materials.velocityMaterial);
            unifroms.velocity.dataTex.value = read;
         });

         // update advection(移流)
         const outPutTexture = updateRenderTarget(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            unifroms.advection.dataTex.value = read;
         });

         // return final texture
         return outPutTexture;
      },
      [unifroms, materials, setMeshMaterial, updatePointer, updateRenderTarget]
   );
   return handleUpdate;
};
