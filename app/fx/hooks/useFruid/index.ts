import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo, useRef } from "react";
import { usePointer } from "../utils/usePointer";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";

export type FruidParams = {
   density_dissipation: number;
   velocity_dissipation: number;
   velocity_acceleration: number;
   pressure_dissipation: number;
   pressure_iterations: number;
   curl_strength: number;
   splat_radius: number;
   fruid_color: (velocity: THREE.Vector2) => THREE.Vector3;
};

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useFruid = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const [materials, setMeshMaterial] = useMesh(scene);
   const camera = useCamera();
   const updatePointer = usePointer();

   // FBO
   const updateVelocityFBO = useDoubleFBO(scene, camera);
   const updateDensityFBO = useDoubleFBO(scene, camera);
   const updateCurlFBO = useSingleFBO(scene, camera);
   const updateDivergenceFBO = useSingleFBO(scene, camera);
   const updatePressureFBO = useDoubleFBO(scene, camera);

   const lastTime = useRef(0);
   /**œ
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState, params: FruidParams) => {
         const { gl, pointer, clock, size } = props;
         const {
            velocity_dissipation,
            density_dissipation,
            velocity_acceleration,
            splat_radius,
            curl_strength,
            fruid_color,
            pressure_dissipation,
            pressure_iterations,
         } = params;

         // update clock
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
               velocity_dissipation
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
               density_dissipation
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
                  new THREE.Vector2(size.width, size.height).multiplyScalar(
                     velocity_acceleration
                  )
               );
               setUniform(
                  materials.splatMaterial,
                  "color",
                  new THREE.Vector3(scaledDiff.x, scaledDiff.y, 1.0)
               );
               setUniform(materials.splatMaterial, "radius", splat_radius);
            });
            updateDensityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               setUniform(materials.splatMaterial, "uTarget", read);
               const color: THREE.Vector3 = fruid_color
                  ? fruid_color(velocity)
                  : new THREE.Vector3(1.0, 1.0, 1.0);
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
            setUniform(materials.vorticityMaterial, "curl", curl_strength);
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
            setUniform(materials.clearMaterial, "value", pressure_dissipation);
         });

         // solve pressure iterative (Gauss-Seidel)
         setMeshMaterial(materials.pressureMaterial);
         setUniform(materials.pressureMaterial, "uDivergence", divergenceTex);
         let pressureTexTemp: THREE.Texture;
         for (let i = 0; i < pressure_iterations; i++) {
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

         // return final texture
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
      ]
   );
   return handleUpdate;
};
