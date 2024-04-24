import * as THREE from "three";
import { FluidMaterials, FluidOnBeforeCompile, useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useCallback, useMemo, useRef } from "react";
import { PointerValues, usePointer } from "../../../misc/usePointer";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
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
} & HooksProps): HooksReturn<FluidParams, FluidObject> => {
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

   const updateAdvection = setUniform(materials.advectionMaterial);
   const updateSplat = setUniform(materials.splatMaterial);
   const updateCurl = setUniform(materials.curlMaterial);
   const updateVorticity = setUniform(materials.vorticityMaterial);
   const updateDivergence = setUniform(materials.divergenceMaterial);
   const updateClear = setUniform(materials.clearMaterial);
   const updatePressure = setUniform(materials.pressureMaterial);
   const updateGradientSubtract = setUniform(
      materials.gradientSubtractMaterial
   );

   const updateFx = useCallback(
      (props: RootState, updateParams?: FluidParams) => {
         const { gl, pointer, clock, size } = props;

         updateParams && setParams(updateParams);

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
            updateAdvection("uVelocity", read);
            updateAdvection("uSource", read);
            updateAdvection("dt", dt);
            updateAdvection("dissipation", params.velocity_dissipation!);
         });

         // update density
         const densityTex = updateDensityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            updateAdvection("uVelocity", velocityTex);
            updateAdvection("uSource", read);
            updateAdvection("dissipation", params.density_dissipation!);
         });

         // update splatting
         const pointerValues = params.pointerValues! || updatePointer(pointer);

         if (pointerValues.isVelocityUpdate) {
            updateVelocityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               updateSplat("uTarget", read);
               updateSplat("point", pointerValues.currentPointer);
               const scaledDiff = pointerValues.diffPointer.multiply(
                  scaledDiffVec.current
                     .set(size.width, size.height)
                     .multiplyScalar(params.velocity_acceleration!)
               );
               updateSplat(
                  "color",
                  spaltVec.current.set(scaledDiff.x, scaledDiff.y, 1.0)
               );
               updateSplat("radius", params.splat_radius!);
            });
            updateDensityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               updateSplat("uTarget", read);
               const color: THREE.Vector3 | THREE.Color =
                  typeof params.fluid_color === "function"
                     ? params.fluid_color(pointerValues.velocity)
                     : params.fluid_color!;
               updateSplat("color", color);
            });
         }

         // update curl
         const curlTex = updateCurlFBO(gl, () => {
            setMeshMaterial(materials.curlMaterial);
            updateCurl("uVelocity", velocityTex);
         });

         // update vorticity
         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.vorticityMaterial);
            updateVorticity("uVelocity", read);
            updateVorticity("uCurl", curlTex);
            updateVorticity("curl", params.curl_strength!);
            updateVorticity("dt", dt);
         });

         // update divergence
         const divergenceTex = updateDivergenceFBO(gl, () => {
            setMeshMaterial(materials.divergenceMaterial);
            updateDivergence("uVelocity", velocityTex);
         });

         // update pressure
         updatePressureFBO(gl, ({ read }) => {
            setMeshMaterial(materials.clearMaterial);
            updateClear("uTexture", read);
            updateClear("value", params.pressure_dissipation!);
         });

         // solve pressure iterative (Gauss-Seidel)
         setMeshMaterial(materials.pressureMaterial);
         updatePressure("uDivergence", divergenceTex);
         let pressureTexTemp: THREE.Texture;
         for (let i = 0; i < params.pressure_iterations!; i++) {
            pressureTexTemp = updatePressureFBO(gl, ({ read }) => {
               updatePressure("uPressure", read);
            });
         }

         // update gradienSubtract
         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.gradientSubtractMaterial);
            updateGradientSubtract("uPressure", pressureTexTemp);
            updateGradientSubtract("uVelocity", read);
         });

         return densityTex;
      },
      [
         materials,
         updateAdvection,
         updateClear,
         updateCurl,
         updateDivergence,
         updateGradientSubtract,
         updatePressure,
         updateSplat,
         updateVorticity,
         setMeshMaterial,
         updateCurlFBO,
         updateDensityFBO,
         updateDivergenceFBO,
         updatePointer,
         updatePressureFBO,
         updateVelocityFBO,
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
