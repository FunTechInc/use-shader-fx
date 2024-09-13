import * as THREE from "three";
import {
   CustomizableKeys,
   FluidMaterials,
   CustomFluidProps,
   CustomFluidParams,
   useMesh,
} from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useCallback, useMemo, useRef } from "react";
import { PointerValues, usePointer } from "../../../misc/usePointer";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { UseFboProps } from "../../../utils/useSingleFBO";
import { DoubleRenderTarget, useDoubleFBO } from "../../../utils/useDoubleFBO";
import { getDpr } from "../../../utils/getDpr";

export const DELTA_TIME = 0.016;

export type FluidParams = {
   /** density disspation , default : `0.98` */
   densityDissipation?: number;
   /** velocity dissipation , default : `0.99` */
   velocityDissipation?: number;
   /** velocity acceleration , default : `10.0` */
   velocityAcceleration?: number;
   /** pressure dissipation , default : `0.9` */
   pressureDissipation?: number;
   /** pressure iterations. affects performance , default : `20` */
   pressureIterations?: number;
   /** curl_strength , default : `35` */
   curlStrength?: number;
   /** splat radius , default : `0.002` */
   splatRadius?: number;
   /** Fluid Color.THREE.Vector3 Alternatively, it accepts a function that returns THREE.Vector3.The function takes velocity:THREE.Vector2 as an argument. , default : `THREE.Vector3(1.0, 1.0, 1.0)` */
   fluidColor?:
      | ((velocity: THREE.Vector2) => THREE.Vector3)
      | THREE.Vector3
      | THREE.Color;
   /** When calling usePointer in a frame loop, setting PointerValues ​​to this value prevents double calls , default : `false` */
   pointerValues?: PointerValues | false;
};

export type FluidObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   materials: FluidMaterials;
   camera: THREE.Camera;
   renderTarget: {
      velocity: DoubleRenderTarget;
      density: DoubleRenderTarget;
      curl: THREE.WebGLRenderTarget;
      divergence: THREE.WebGLRenderTarget;
      pressure: DoubleRenderTarget;
   };
   output: THREE.Texture;
};

export const FLUID_PARAMS: FluidParams = Object.freeze({
   densityDissipation: 0.98,
   velocityDissipation: 0.99,
   velocityAcceleration: 10.0,
   pressureDissipation: 0.9,
   pressureIterations: 20,
   curlStrength: 35,
   splatRadius: 0.002,
   fluidColor: new THREE.Vector3(1.0, 1.0, 1.0),
   pointerValues: false,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useFluid = ({
   size,
   dpr,
   renderTargetOptions,
   isSizeUpdate,
   customFluidProps,
}: {
   /** you can add `onBeforeInit` of the next material.`initial`,`curl`,`vorticity`,`advection`,`divergence`,`pressure`,`clear`,`gradientSubtract`,`splat` 
	 * ```ts
	 * customFluidProps: {
         vorticity: {
            onBeforeInit: (parameters) => console.log(parameters),
         },
      },
	 * ```
	*/
   customFluidProps?: CustomFluidProps;
} & HooksProps): HooksReturn<FluidParams, FluidObject, CustomFluidParams> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { materials, setMeshMaterial, mesh } = useMesh({
      scene,
      size,
      dpr: _dpr.shader,
      customFluidProps,
   });
   const camera = useCamera(size);
   const updatePointer = usePointer();

   const fboProps = useMemo<UseFboProps>(
      () => ({
         scene,
         camera,
         dpr: _dpr.fbo,
         size,
         isSizeUpdate,
         type: THREE.HalfFloatType,
         ...renderTargetOptions,
      }),
      [scene, camera, size, _dpr.fbo, isSizeUpdate, renderTargetOptions]
   );
   const [velocityFBO, updateVelocityFBO] = useDoubleFBO(fboProps);
   const [densityFBO, updateDensityFBO] = useDoubleFBO(fboProps);
   const [curlFBO, updateCurlFBO] = useSingleFBO(fboProps);
   const [divergenceFBO, updateDivergenceFBO] = useSingleFBO(fboProps);
   const [pressureFBO, updatePressureFBO] = useDoubleFBO(fboProps);

   const scaledDiffVec = useRef(new THREE.Vector2(0, 0));
   const spaltVec = useRef(new THREE.Vector3(0, 0, 0));

   const [params, setParams] = useParams<FluidParams>(FLUID_PARAMS);

   // setUniform
   const updateParamsList = useMemo(
      () => ({
         advection: setUniform(materials.advectionMaterial),
         splat: setUniform(materials.splatMaterial),
         curl: setUniform(materials.curlMaterial),
         vorticity: setUniform(materials.vorticityMaterial),
         divergence: setUniform(materials.divergenceMaterial),
         clear: setUniform(materials.clearMaterial),
         pressure: setUniform(materials.pressureMaterial),
         gradientSubtract: setUniform(materials.gradientSubtractMaterial),
      }),
      [materials]
   );
   // customSetUniform
   const updateCustomParamsList = useMemo<{
      [K in CustomizableKeys]: (customParams: CustomParams | undefined) => void;
   }>(
      () => ({
         advection: setCustomUniform(materials.advectionMaterial),
         splat: setCustomUniform(materials.splatMaterial),
         curl: setCustomUniform(materials.curlMaterial),
         vorticity: setCustomUniform(materials.vorticityMaterial),
         divergence: setCustomUniform(materials.divergenceMaterial),
         clear: setCustomUniform(materials.clearMaterial),
         pressure: setCustomUniform(materials.pressureMaterial),
         gradientSubtract: setCustomUniform(materials.gradientSubtractMaterial),
      }),
      [materials]
   );

   const updateParams = useCallback(
      (newParams?: FluidParams, customParams?: CustomFluidParams) => {
         setParams(newParams);
         if (customParams) {
            Object.keys(customParams).forEach((key) => {
               updateCustomParamsList[key as CustomizableKeys](
                  customParams[key as CustomizableKeys]
               );
            });
         }
      },
      [setParams, updateCustomParamsList]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: FluidParams,
         customParams?: CustomFluidParams
      ) => {
         const { gl, pointer, size } = rootState;

         updateParams(newParams, customParams);

         const velocityTex = updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            updateParamsList.advection("uVelocity", read);
            updateParamsList.advection("uSource", read);
            updateParamsList.advection(
               "dissipation",
               params.velocityDissipation!
            );
         });

         const densityTex = updateDensityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            updateParamsList.advection("uVelocity", velocityTex);
            updateParamsList.advection("uSource", read);
            updateParamsList.advection(
               "dissipation",
               params.densityDissipation!
            );
         });

         const pointerValues = params.pointerValues! || updatePointer(pointer);

         if (pointerValues.isVelocityUpdate) {
            updateVelocityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               updateParamsList.splat("uTarget", read);
               updateParamsList.splat("point", pointerValues.currentPointer);
               const scaledDiff = pointerValues.diffPointer.multiply(
                  scaledDiffVec.current
                     .set(size.width, size.height)
                     .multiplyScalar(params.velocityAcceleration!)
               );
               updateParamsList.splat(
                  "color",
                  spaltVec.current.set(scaledDiff.x, scaledDiff.y, 1.0)
               );
               updateParamsList.splat("radius", params.splatRadius!);
            });
            updateDensityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               updateParamsList.splat("uTarget", read);
               const color: THREE.Vector3 | THREE.Color =
                  typeof params.fluidColor === "function"
                     ? params.fluidColor(pointerValues.velocity)
                     : params.fluidColor!;
               updateParamsList.splat("color", color);
            });
         }

         const curlTex = updateCurlFBO(gl, () => {
            setMeshMaterial(materials.curlMaterial);
            updateParamsList.curl("uVelocity", velocityTex);
         });

         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.vorticityMaterial);
            updateParamsList.vorticity("uVelocity", read);
            updateParamsList.vorticity("uCurl", curlTex);
            updateParamsList.vorticity("curl", params.curlStrength!);
         });

         const divergenceTex = updateDivergenceFBO(gl, () => {
            setMeshMaterial(materials.divergenceMaterial);
            updateParamsList.divergence("uVelocity", velocityTex);
         });

         updatePressureFBO(gl, ({ read }) => {
            setMeshMaterial(materials.clearMaterial);
            updateParamsList.clear("uTexture", read);
            updateParamsList.clear("value", params.pressureDissipation!);
         });

         setMeshMaterial(materials.pressureMaterial);
         updateParamsList.pressure("uDivergence", divergenceTex);
         let pressureTexTemp: THREE.Texture;
         for (let i = 0; i < params.pressureIterations!; i++) {
            pressureTexTemp = updatePressureFBO(gl, ({ read }) => {
               updateParamsList.pressure("uPressure", read);
            });
         }

         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.gradientSubtractMaterial);
            updateParamsList.gradientSubtract("uPressure", pressureTexTemp);
            updateParamsList.gradientSubtract("uVelocity", read);
         });

         return densityTex;
      },
      [
         materials,
         updateParamsList,
         setMeshMaterial,
         updateCurlFBO,
         updateDensityFBO,
         updateDivergenceFBO,
         updatePointer,
         updatePressureFBO,
         updateVelocityFBO,
         params,
         updateParams,
      ]
   );
   return [
      updateFx,
      updateParams,
      {
         scene: scene,
         mesh: mesh,
         materials: materials,
         camera: camera,
         renderTarget: {
            velocity: velocityFBO,
            density: densityFBO,
            curl: curlFBO,
            divergence: divergenceFBO,
            pressure: pressureFBO,
         },
         output: densityFBO.read.texture,
      },
   ];
};
