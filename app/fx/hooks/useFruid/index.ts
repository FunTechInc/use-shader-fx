import * as THREE from "three";
import { FruidMaterials, useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { DoubleRenderTarget, useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo, useRef } from "react";
import { usePointer } from "../utils/usePointer";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../utils/useParams";

export type FruidParams = {
   density_dissipation?: number;
   velocity_dissipation?: number;
   velocity_acceleration?: number;
   pressure_dissipation?: number;
   pressure_iterations?: number;
   curl_strength?: number;
   splat_radius?: number;
   fruid_color?: ((velocity: THREE.Vector2) => THREE.Vector3) | THREE.Vector3;
};

export type FruidObject = {
   scene: THREE.Scene;
   materials: FruidMaterials;
   camera: THREE.Camera;
   renderTarget: {
      velocity: DoubleRenderTarget;
      density: DoubleRenderTarget;
      curl: THREE.WebGLRenderTarget;
      divergence: THREE.WebGLRenderTarget;
      pressure: DoubleRenderTarget;
   };
};

export const useFruid = (): HooksReturn<FruidParams, FruidObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const [materials, setMeshMaterial] = useMesh(scene);
   const camera = useCamera();
   const updatePointer = usePointer();

   const [velocityFBO, updateVelocityFBO] = useDoubleFBO(scene, camera, {
      isDpr: true,
   });
   const [densityFBO, updateDensityFBO] = useDoubleFBO(scene, camera, {
      isDpr: true,
   });
   const [curlFBO, updateCurlFBO] = useSingleFBO(scene, camera, {
      isDpr: true,
   });
   const [divergenceFBO, updateDivergenceFBO] = useSingleFBO(scene, camera, {
      isDpr: true,
   });
   const [pressureFBO, updatePressureFBO] = useDoubleFBO(scene, camera, {
      isDpr: true,
   });

   const lastTime = useRef(0);
   const scaledDiffVec = useRef(new THREE.Vector2(0, 0));
   const spaltVec = useRef(new THREE.Vector3(0, 0, 0));

   const [params, setParams] = useParams<FruidParams>({
      density_dissipation: 0.0,
      velocity_dissipation: 0.0,
      velocity_acceleration: 0.0,
      pressure_dissipation: 0.0,
      pressure_iterations: 20,
      curl_strength: 0.0,
      splat_radius: 0.001,
      fruid_color: new THREE.Vector3(1.0, 1.0, 1.0),
   });

   const updateFx = useCallback(
      (props: RootState, updateParams: FruidParams) => {
         const { gl, pointer, clock, size } = props;

         setParams(updateParams);

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
                  typeof params.fruid_color === "function"
                     ? params.fruid_color(velocity)
                     : params.fruid_color!;
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
   return {
      updateFx,
      setParams,
      fxObject: {
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
   };
};
