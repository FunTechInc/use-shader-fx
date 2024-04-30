import * as THREE from "three";
import {
   CustomizableKeys,
   FluidCustomParams,
   FluidMaterials,
   FluidOnBeforeCompile,
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

export type FluidParams = {
   /** density disspation , default : `0.98` */
   density_dissipation?: number;
   /** velocity dissipation , default : `0.99` */
   velocity_dissipation?: number;
   /** velocity acceleration , default : `10.0` */
   velocity_acceleration?: number;
   /** pressure dissipation , default : `0.9` */
   pressure_dissipation?: number;
   /** pressure iterations. affects performance , default : `20` */
   pressure_iterations?: number;
   /** curl_strength , default : `35` */
   curl_strength?: number;
   /** splat radius , default : `0.002` */
   splat_radius?: number;
   /** Fluid Color.THREE.Vector3 Alternatively, it accepts a function that returns THREE.Vector3.The function takes velocity:THREE.Vector2 as an argument. , default : `THREE.Vector3(1.0, 1.0, 1.0)` */
   fluid_color?:
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
   density_dissipation: 0.98,
   velocity_dissipation: 0.99,
   velocity_acceleration: 10.0,
   pressure_dissipation: 0.9,
   pressure_iterations: 20,
   curl_strength: 35,
   splat_radius: 0.002,
   fluid_color: new THREE.Vector3(1.0, 1.0, 1.0),
   pointerValues: false,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useFluid = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   fluidOnBeforeCompile,
}: {
   /** you can add `onBeforeComile` of the next material.`initial`,`curl`,`vorticity`,`advection`,`divergence`,`pressure`,`clear`,`gradientSubtract`,`splat` 
	 * ```ts
	 * fluidOnBeforeCompile: {
         vorticity: {
            onBeforeCompile: (shader) => console.log(shader),
         },
      },
	 * ```
	*/
   fluidOnBeforeCompile?: FluidOnBeforeCompile;
} & HooksProps): HooksReturn<FluidParams, FluidObject, FluidCustomParams> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { materials, setMeshMaterial, mesh } = useMesh({
      scene,
      size,
      dpr: _dpr.shader,
      fluidOnBeforeCompile,
   });
   const camera = useCamera(size);
   const updatePointer = usePointer();

   const fboProps = useMemo<UseFboProps>(
      () => ({
         scene,
         camera,
         dpr: _dpr.fbo,
         size,
         samples,
         isSizeUpdate,
      }),
      [scene, camera, size, samples, _dpr.fbo, isSizeUpdate]
   );
   const [velocityFBO, updateVelocityFBO] = useDoubleFBO(fboProps);
   const [densityFBO, updateDensityFBO] = useDoubleFBO(fboProps);
   const [curlFBO, updateCurlFBO] = useSingleFBO(fboProps);
   const [divergenceFBO, updateDivergenceFBO] = useSingleFBO(fboProps);
   const [pressureFBO, updatePressureFBO] = useDoubleFBO(fboProps);

   const lastTime = useRef(0);
   const scaledDiffVec = useRef(new THREE.Vector2(0, 0));
   const spaltVec = useRef(new THREE.Vector3(0, 0, 0));

   const [params, setParams] = useParams<FluidParams>(FLUID_PARAMS);

   // setUniform
   const updateParams = useMemo(
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
   const updateCustomParams = useMemo<{
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

   const updateFx = useCallback(
      (
         props: RootState,
         newParams?: FluidParams,
         customParams?: FluidCustomParams
      ) => {
         const { gl, pointer, clock, size } = props;

         newParams && setParams(newParams);

         if (lastTime.current === 0) {
            lastTime.current = clock.getElapsedTime();
         }
         const dt = Math.min(
            (clock.getElapsedTime() - lastTime.current) / 3,
            0.02
         );
         lastTime.current = clock.getElapsedTime();

         // update velocity
         const velocityTex = updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            updateParams.advection("uVelocity", read);
            updateParams.advection("uSource", read);
            updateParams.advection("dt", dt);
            updateParams.advection("dissipation", params.velocity_dissipation!);
         });

         // update density
         const densityTex = updateDensityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            updateParams.advection("uVelocity", velocityTex);
            updateParams.advection("uSource", read);
            updateParams.advection("dissipation", params.density_dissipation!);
         });

         // update splatting
         const pointerValues = params.pointerValues! || updatePointer(pointer);

         if (pointerValues.isVelocityUpdate) {
            updateVelocityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               updateParams.splat("uTarget", read);
               updateParams.splat("point", pointerValues.currentPointer);
               const scaledDiff = pointerValues.diffPointer.multiply(
                  scaledDiffVec.current
                     .set(size.width, size.height)
                     .multiplyScalar(params.velocity_acceleration!)
               );
               updateParams.splat(
                  "color",
                  spaltVec.current.set(scaledDiff.x, scaledDiff.y, 1.0)
               );
               updateParams.splat("radius", params.splat_radius!);
            });
            updateDensityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               updateParams.splat("uTarget", read);
               const color: THREE.Vector3 | THREE.Color =
                  typeof params.fluid_color === "function"
                     ? params.fluid_color(pointerValues.velocity)
                     : params.fluid_color!;
               updateParams.splat("color", color);
            });
         }

         // update curl
         const curlTex = updateCurlFBO(gl, () => {
            setMeshMaterial(materials.curlMaterial);
            updateParams.curl("uVelocity", velocityTex);
         });

         // update vorticity
         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.vorticityMaterial);
            updateParams.vorticity("uVelocity", read);
            updateParams.vorticity("uCurl", curlTex);
            updateParams.vorticity("curl", params.curl_strength!);
            updateParams.vorticity("dt", dt);
         });

         // update divergence
         const divergenceTex = updateDivergenceFBO(gl, () => {
            setMeshMaterial(materials.divergenceMaterial);
            updateParams.divergence("uVelocity", velocityTex);
         });

         // update pressure
         updatePressureFBO(gl, ({ read }) => {
            setMeshMaterial(materials.clearMaterial);
            updateParams.clear("uTexture", read);
            updateParams.clear("value", params.pressure_dissipation!);
         });

         // solve pressure iterative (Gauss-Seidel)
         setMeshMaterial(materials.pressureMaterial);
         updateParams.pressure("uDivergence", divergenceTex);
         let pressureTexTemp: THREE.Texture;
         for (let i = 0; i < params.pressure_iterations!; i++) {
            pressureTexTemp = updatePressureFBO(gl, ({ read }) => {
               updateParams.pressure("uPressure", read);
            });
         }

         // update gradienSubtract
         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.gradientSubtractMaterial);
            updateParams.gradientSubtract("uPressure", pressureTexTemp);
            updateParams.gradientSubtract("uVelocity", read);
         });

         // update custom params
         if (customParams) {
            Object.keys(customParams).forEach((key) => {
               updateCustomParams[key as CustomizableKeys](
                  customParams[key as CustomizableKeys]
               );
            });
         }

         return densityTex;
      },
      [
         materials,
         updateParams,
         setMeshMaterial,
         updateCurlFBO,
         updateDensityFBO,
         updateDivergenceFBO,
         updatePointer,
         updatePressureFBO,
         updateVelocityFBO,
         updateCustomParams,
         setParams,
         params,
      ]
   );
   return [
      updateFx,
      setParams,
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
