import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useRenderTarget } from "../utils/useRenderTarget";
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
   const updateRenderTarget = useRenderTarget();

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
         updateRenderTarget(gl, (fbo) => {
            unifroms.divergence.dataTex.value = fbo.read!.texture;
            setMeshMaterial(materials.divergenceMaterial);
            gl.render(scene, camera.current);
         });

         // update pressure(圧力)
         const solverIteration = 20; //TODO：これも変数化
         for (let i = 0; i < solverIteration; i++) {
            updateRenderTarget(gl, (fbo) => {
               unifroms.pressure.dataTex.value = fbo.read!.texture;
               setMeshMaterial(materials.pressureMaterial);
               gl.render(scene, camera.current);
            });
         }

         // update velocity(速度)
         const { currentPointer, prevPointer } = updatePointer(pointer);
         unifroms.velocity.pointerPos.value = currentPointer.clone();
         unifroms.velocity.beforePointerPos.value = prevPointer.clone();
         updateRenderTarget(gl, (fbo) => {
            unifroms.velocity.dataTex.value = fbo.read!.texture;
            setMeshMaterial(materials.velocityMaterial);
            gl.render(scene, camera.current);
         });

         // update advection(移流)
         const outPutTexture = updateRenderTarget(gl, (fbo) => {
            unifroms.advection.dataTex.value = fbo.read!.texture;
            setMeshMaterial(materials.advectionMaterial);
            gl.render(scene, camera.current);
         });

         /*===============================================
			カールとうずまき
			===============================================*/
         // //ここな気がするよな〜カール ここに速度テクスチャーを加える？
         // updateRenderTarget(gl, (fbo) => {
         //    unifroms.curl.uVelocity.value = fbo.read!.texture;
         //    setMeshMaterial(materials.curlMaterial);
         //    gl.render(scene, camera.current);
         // });

         // うずまきにcurlとvelocityを加える
         // updateRenderTarget(gl, (fbo) => {
         //    unifroms.vorticity.uVelocity.value = fbo.read!.texture;
         //    unifroms.vorticity.uCurl.value = fbo.read!.texture;
         //    setMeshMaterial(materials.vorticityMaterial);
         //    gl.render(scene, camera.current);
         // });
         /*===============================================
			//カールと渦巻き
			===============================================*/

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
