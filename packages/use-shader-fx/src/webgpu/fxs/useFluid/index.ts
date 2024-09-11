import * as THREE from "three/webgpu";
import { useCallback, useMemo, useRef } from "react";
import { useCamera } from "../../utils/useCamera";
import { UseFboProps, useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn, OnInit, RootState } from "../types";
import { getDpr } from "../../utils/getDpr";
import { useAddObject } from "../../utils/useAddObject";
import {
   AdvectionNodeMaterial,
   ClearNodeMaterial,
   CurlNodeMaterial,
   DivergenceNodeMaterial,
   GradientSubtractNodeMaterial,
   initialNodeMaterial,
   PressureNodeMaterial,
   SplatNodeMaterial,
   VorticityNodeMaterial,
} from "./materials";
import { useMaterials } from "./useMaterials";
import { useDoubleFBO } from "../../utils/useDoubleFBO";
import { usePointer } from "../../misc/usePointer";

type FluidValues = {};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 *
 * It is a basic value noise with `fbm` and `domain warping`
 */
export const useFluid = (
   {
      size,
      dpr,
      sizeUpdate,
      renderTargetOptions,
      ...values
   }: HooksProps & FluidValues,
   onInit?: OnInit<any>
): HooksReturn<FluidValues, any> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);

   const camera = useCamera(size);

   const updatePointer = usePointer();

   // materials
   const { materials, setMaterial } = useMaterials({
      scene,
      size,
      dpr: _dpr.shader,
   });

   // fbos
   const fboProps = useMemo<UseFboProps>(
      () => ({
         scene,
         camera,
         dpr: _dpr.fbo,
         size,
         sizeUpdate,
         type: THREE.HalfFloatType,
         ...renderTargetOptions,
      }),
      []
   );
   const [velocityFBO, updateVelocityFBO] = useDoubleFBO(fboProps);
   const [densityFBO, updateDensityFBO] = useDoubleFBO(fboProps);
   const [curlFBO, updateCurlFBO] = useSingleFBO(fboProps);
   const [divergenceFBO, updateDivergenceFBO] = useSingleFBO(fboProps);
   const [pressureFBO, updatePressureFBO] = useDoubleFBO(fboProps);
   const scaledDiffVec = useRef(new THREE.Vector2(0, 0));
   const spaltVec = useRef(new THREE.Vector3(0, 0, 0));

   const setValues = useCallback((newValues: FluidValues) => {
      // material.setValues(newValues as THREE.MaterialParameters);
   }, []);

   const COLOR_TEMP = new THREE.Vector3(1, 1, 1); // TODO*一時しのぎ

   const render = useCallback(
      (rootState: RootState, newValues?: FluidValues) => {
         const { gl, pointer, size } = rootState;

         // 移流_advectionの計算
         const velocityTex = updateVelocityFBO(gl, ({ read }) => {
            setMaterial(materials.advectionMat);
            materials.advectionMat.setValues({
               velocity: read,
               source: read,
               dissipation: 0.99,
            });
         });

         // 密度に移流_advectionを適用する
         const densityTex = updateDensityFBO(gl, ({ read }) => {
            setMaterial(materials.advectionMat);
            materials.advectionMat.setValues({
               velocity: velocityTex,
               source: read,
               dissipation: 0.99,
            });
         });

         const pointerValues = updatePointer(pointer);

         if (pointerValues.isVelocityUpdate) {
            // 速度に外圧の計算
            updateVelocityFBO(gl, ({ read }) => {
               setMaterial(materials.splatMat);
               const scaledDiff = pointerValues.diffPointer.multiply(
                  scaledDiffVec.current
                     .set(size.width, size.height)
                     .multiplyScalar(0.6)
               );

               materials.splatMat.setValues({
                  target: read,
                  point: pointerValues.currentPointer,
                  color: spaltVec.current.set(scaledDiff.x, scaledDiff.y, 1.0),
                  radius: 0.001,
               });
            });
            // 密度にも反映
            updateDensityFBO(gl, ({ read }) => {
               setMaterial(materials.splatMat);
               materials.splatMat.setValues({
                  target: read,
                  color: COLOR_TEMP,
               });
            });
         }

         // //うず項目
         // const curlIntensity = 0.1; // TODO*変数
         // if (curlIntensity > 0) {
         //    const curlTex = updateCurlFBO(gl, () => {
         //       setMaterial(materials.curlMat);
         //       materials.curlMat.setValues({
         //          velocity: velocityTex,
         //       });
         //    });
         //    updateVelocityFBO(gl, ({ read }) => {
         //       setMaterial(materials.vorticityMat);
         //       materials.vorticityMat.setValues({
         //          velocity: read,
         //          curl: curlTex,
         //          curlIntensity: curlIntensity,
         //       });
         //    });
         // }

         // 発散
         // const divergenceTex = updateDivergenceFBO(gl, () => {
         //    setMaterial(materials.divergenceMat);
         //    materials.divergenceMat.setValues({
         //       velocity: velocityTex,
         //    });
         // });

         // // 圧力
         // updatePressureFBO(gl, ({ read }) => {
         //    setMaterial(materials.clearMat);

         //    materials.clearMat.setValues({
         //       texture: read,
         //       value: 0.1, // pressureDissipation
         //    });
         // });

         // setMaterial(materials.pressureMat);
         // // updateParamsList.pressure("uDivergence", divergenceTex);
         // materials.pressureMat.setValues({
         //    divergence: divergenceTex,
         // });

         // let pressureTexTemp: THREE.Texture;
         // // TODO * pressureIterations
         // for (let i = 0; i < 1; i++) {
         //    pressureTexTemp = updatePressureFBO(gl, ({ read }) => {
         //       // updateParamsList.pressure("uPressure", read);
         //       materials.pressureMat.setValues({
         //          pressure: read,
         //       });
         //    });
         // }

         // updateVelocityFBO(gl, ({ read }) => {
         //    setMaterial(materials.gradientSubtractMat);
         //    materials.gradientSubtractMat.setValues({
         //       pressure: pressureTexTemp,
         //       velocity: read,
         //    });
         // });

         return densityTex;
      },
      []
   );

   return {
      render,
      setValues,
      texture: densityFBO.read.texture,
      material: materials,
      scene,
   };
};
