import * as THREE from "three";
import { FluidMaterials, useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { useDoubleFBO } from "../../utils/useDoubleFBO";
import { useCallback, useMemo, useRef } from "react";
import { usePointer } from "../../utils/usePointer";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";
import { DoubleRenderTarget, UseFboProps } from "../../utils/types";

export type FluidParams = {
   /** density disspation , default:0.98 */
   density_dissipation?: number;
   /** velocity dissipation , default:0.99 */
   velocity_dissipation?: number;
   /** velocity acceleration , default:10.0 */
   velocity_acceleration?: number;
   /** pressure dissipation , default:0.9 */
   pressure_dissipation?: number;
   /** pressure iterations. affects performance , default:20 */
   pressure_iterations?: number;
   /** curl_strength , default:35 */
   curl_strength?: number;
   /** splat radius , default:0.002 */
   splat_radius?: number;
   /** Fluid Color.THREE.Vector3 Alternatively, it accepts a function that returns THREE.Vector3.The function takes velocity:THREE.Vector2 as an argument. , default:THREE.Vector3(1.0, 1.0, 1.0) */
   fluid_color?: ((velocity: THREE.Vector2) => THREE.Vector3) | THREE.Vector3;
};

export type FluidObject = {
   scene: THREE.Scene;
   materials: FluidMaterials;
   camera: THREE.Camera;
   renderTarget: {
      velocity: DoubleRenderTarget;
      density: DoubleRenderTarget;
      curl: THREE.WebGLRenderTarget;
      divergence: THREE.WebGLRenderTarget;
      pressure: DoubleRenderTarget;
   };
};

export const FLUID_PARAMS: FluidParams = {
   density_dissipation: 0.98,
   velocity_dissipation: 0.99,
   velocity_acceleration: 10.0,
   pressure_dissipation: 0.9,
   pressure_iterations: 20,
   curl_strength: 35,
   splat_radius: 0.002,
   fluid_color: new THREE.Vector3(1.0, 1.0, 1.0),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useFluid = ({
   size,
   dpr,
}: {
   size: Size;
   dpr: number;
}): HooksReturn<FluidParams, FluidObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const [materials, setMeshMaterial] = useMesh({ scene, size, dpr });
   const camera = useCamera(size);
   const updatePointer = usePointer();

   const fboProps = useMemo<UseFboProps>(
      () => ({
         scene,
         camera,
         size,
      }),
      [scene, camera, size]
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
            setUniform(materials.advectionMaterial, "uVelocity", read);
            setUniform(materials.advectionMaterial, "uSource", read);
            setUniform(materials.advectionMaterial, "dt", dt);
            setUniform(
               materials.advectionMaterial,
               "dissipation",
               params.velocity_dissipation!
            );
         });

         // update density
         const densityTex = updateDensityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            setUniform(materials.advectionMaterial, "uVelocity", velocityTex);
            setUniform(materials.advectionMaterial, "uSource", read);
            setUniform(
               materials.advectionMaterial,
               "dissipation",
               params.density_dissipation!
            );
         });

         // update splatting
         const { currentPointer, diffPointer, isVelocityUpdate, velocity } =
            updatePointer(pointer);
         if (isVelocityUpdate) {
            updateVelocityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               setUniform(materials.splatMaterial, "uTarget", read);
               setUniform(materials.splatMaterial, "point", currentPointer);
               const scaledDiff = diffPointer.multiply(
                  scaledDiffVec.current
                     .set(size.width, size.height)
                     .multiplyScalar(params.velocity_acceleration!)
               );
               setUniform(
                  materials.splatMaterial,
                  "color",
                  spaltVec.current.set(scaledDiff.x, scaledDiff.y, 1.0)
               );
               setUniform(
                  materials.splatMaterial,
                  "radius",
                  params.splat_radius!
               );
            });
            updateDensityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               setUniform(materials.splatMaterial, "uTarget", read);
               const color: THREE.Vector3 =
                  typeof params.fluid_color === "function"
                     ? params.fluid_color(velocity)
                     : params.fluid_color!;
               setUniform(materials.splatMaterial, "color", color);
            });
         }

         // update curl
         const curlTex = updateCurlFBO(gl, () => {
            setMeshMaterial(materials.curlMaterial);
            setUniform(materials.curlMaterial, "uVelocity", velocityTex);
         });

         // update vorticity
         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.vorticityMaterial);
            setUniform(materials.vorticityMaterial, "uVelocity", read);
            setUniform(materials.vorticityMaterial, "uCurl", curlTex);
            setUniform(
               materials.vorticityMaterial,
               "curl",
               params.curl_strength!
            );
            setUniform(materials.vorticityMaterial, "dt", dt);
         });

         // update divergence
         const divergenceTex = updateDivergenceFBO(gl, () => {
            setMeshMaterial(materials.divergenceMaterial);
            setUniform(materials.divergenceMaterial, "uVelocity", velocityTex);
         });

         // update pressure
         updatePressureFBO(gl, ({ read }) => {
            setMeshMaterial(materials.clearMaterial);
            setUniform(materials.clearMaterial, "uTexture", read);
            setUniform(
               materials.clearMaterial,
               "value",
               params.pressure_dissipation!
            );
         });

         // solve pressure iterative (Gauss-Seidel)
         setMeshMaterial(materials.pressureMaterial);
         setUniform(materials.pressureMaterial, "uDivergence", divergenceTex);
         let pressureTexTemp: THREE.Texture;
         for (let i = 0; i < params.pressure_iterations!; i++) {
            pressureTexTemp = updatePressureFBO(gl, ({ read }) => {
               setUniform(materials.pressureMaterial, "uPressure", read);
            });
         }

         // update gradienSubtract
         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.gradientSubtractMaterial);
            setUniform(
               materials.gradientSubtractMaterial,
               "uPressure",
               pressureTexTemp
            );
            setUniform(materials.gradientSubtractMaterial, "uVelocity", read);
         });

         return densityTex;
      },
      [
         materials,
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
         materials: materials,
         camera: camera,
         renderTarget: {
            velocity: velocityFBO,
            density: densityFBO,
            curl: curlFBO,
            divergence: divergenceFBO,
            pressure: pressureFBO,
         },
      },
   ];
};
