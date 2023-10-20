import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo, useRef } from "react";
import { usePointer } from "../utils/usePointer";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";

/*===============================================
constants
===============================================*/
const CONFIG = {
   DENSITY_DISSIPATION: 0.98,
   VELOCITY_DISSIPATION: 0.99,
   VELOCITY_ACCELERATION: 10.0,
   PRESSURE_DISSIPATION: 0.9,
   PRESSURE_ITERATIONS: 25,
   CURL: 30,
   SPLAT_RADIUS: 0.004,
   COLOR: (velocity: THREE.Vector2) => {
      const rCol = Math.random() * 0.5;
      const gCol = Math.random() * 0.5;
      const bCol = Math.random() * 0.5;
      // const rCol = Math.max(0.0, velocity.x * 100);
      // const gCol = Math.max(0.0, velocity.y * 100);
      // const bCol = (rCol + gCol) / 2;
      return new THREE.Vector3(rCol, gCol, bCol);
   },
};

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useFruid_2 = () => {
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

   // const unifroms = useMemo(
   //    () => ({
   //       divergence: materials.divergenceMaterial.uniforms,
   //       pressure: materials.pressureMaterial.uniforms,
   //       curl: materials.curlMaterial.uniforms,
   //       vorticity: materials.vorticityMaterial.uniforms,
   //       advection: materials.advectionMaterial.uniforms,
   //       clear: materials.clearMaterial.uniforms,
   //       gradientSubtract: materials.gradientSubtractMaterial.uniforms,
   //       splat: materials.splatMaterial.uniforms,
   //    }),
   //    [materials]
   // );

   const lastTime = useRef(0);
   /**œ
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback(
      (props: RootState) => {
         const { gl, pointer, clock, size } = props;

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
               CONFIG.VELOCITY_DISSIPATION
            );
         });

         // update density
         const densityTex = updateDensityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.advectionMaterial);
            unifroms.advection.uVelocity.value = velocityTex;
            unifroms.advection.uSource.value = read;
            unifroms.advection.dissipation.value = CONFIG.DENSITY_DISSIPATION;
         });

         // update splatting
         const { currentPointer, diffPointer, isVelocityUpdate, velocity } =
            updatePointer(pointer);

         if (isVelocityUpdate) {
            updateVelocityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               unifroms.splat.uTarget.value = read;
               unifroms.splat.point.value = currentPointer;
               const scaledDiff = diffPointer.multiply(
                  new THREE.Vector2(size.width, size.height).multiplyScalar(
                     CONFIG.VELOCITY_ACCELERATION
                  )
               );
               unifroms.splat.color.value = new THREE.Vector3(
                  scaledDiff.x,
                  scaledDiff.y,
                  1.0
               );
               unifroms.splat.radius.value = CONFIG.SPLAT_RADIUS;
            });
            updateDensityFBO(gl, ({ read }) => {
               setMeshMaterial(materials.splatMaterial);
               unifroms.splat.uTarget.value = read;
               const color: THREE.Vector3 = CONFIG.COLOR
                  ? CONFIG.COLOR(velocity)
                  : new THREE.Vector3(1.0, 1.0, 1.0);
               unifroms.splat.color.value = color;
            });
         }

         // update curl
         const curlTex = updateCurlFBO(gl, () => {
            setMeshMaterial(materials.curlMaterial);
            unifroms.curl.uVelocity.value = velocityTex;
         });

         // update vorticity
         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.vorticityMaterial);
            unifroms.vorticity.uVelocity.value = read;
            unifroms.vorticity.uCurl.value = curlTex;
            unifroms.vorticity.curl.value = CONFIG.CURL;
            unifroms.vorticity.dt.value = dt;
         });

         // update divergence
         const divergenceTex = updateDivergenceFBO(gl, () => {
            setMeshMaterial(materials.divergenceMaterial);
            unifroms.divergence.uVelocity.value = velocityTex;
         });

         // update pressure
         updatePressureFBO(gl, ({ read }) => {
            setMeshMaterial(materials.clearMaterial);
            unifroms.clear.uTexture.value = read;
            unifroms.clear.value.value = CONFIG.PRESSURE_DISSIPATION;
         });

         // solve pressure iterative (Gauss-Seidel)
         setMeshMaterial(materials.pressureMaterial);
         unifroms.pressure.uDivergence.value = divergenceTex;
         let pressureTexTemp: THREE.Texture;
         for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
            pressureTexTemp = updatePressureFBO(gl, ({ read }) => {
               unifroms.pressure.uPressure.value = read;
            });
         }

         // update gradienSubtract
         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.gradientSubtractMaterial);
            unifroms.gradientSubtract.uPressure.value = pressureTexTemp;
            unifroms.gradientSubtract.uVelocity.value = read;
         });

         // return final texture
         return densityTex;
      },
      [
         materials,
         unifroms,
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
