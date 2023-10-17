import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { usePointer } from "../utils/usePointer";
import { RootState } from "@react-three/fiber";

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useFruid = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const [materials, setMeshMaterial] = useMesh(scene);
   const camera = useCamera();
   const updatePointer = usePointer();

   //FBO
   const updateRenderTarget = useDoubleFBO();

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
            unifroms.divergence.dataTex.value = read;
            setMeshMaterial(materials.divergenceMaterial);
            gl.render(scene, camera.current);
         });

         // update pressure(圧力)
         const solverIteration = 30; //TODO：これも変数化
         for (let i = 0; i < solverIteration; i++) {
            updateRenderTarget(gl, ({ read }) => {
               unifroms.pressure.dataTex.value = read;
               setMeshMaterial(materials.pressureMaterial);
               gl.render(scene, camera.current);
            });
         }

         // update velocity(速度)
         const { currentPointer, prevPointer } = updatePointer(pointer);
         unifroms.velocity.pointerPos.value = currentPointer.clone();
         unifroms.velocity.beforePointerPos.value = prevPointer.clone();
         updateRenderTarget(gl, ({ read }) => {
            unifroms.velocity.dataTex.value = read;
            setMeshMaterial(materials.velocityMaterial);
            gl.render(scene, camera.current);
         });

         // update advection(移流)
         const outPutTexture = updateRenderTarget(gl, ({ read }) => {
            unifroms.advection.dataTex.value = read;
            setMeshMaterial(materials.advectionMaterial);
            gl.render(scene, camera.current);
         });

         // return final texture
         return outPutTexture;
      },
      [
         scene,
         camera,
         unifroms,
         materials,
         setMeshMaterial,
         updatePointer,
         updateRenderTarget,
      ]
   );
   return handleUpdate;
};

/*===============================================
advection
curl カール
vorticity 渦巻き
pressure
===============================================*/
