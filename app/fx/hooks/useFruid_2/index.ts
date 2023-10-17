import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo, useRef } from "react";
import { usePointer } from "../utils/usePointer";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";

/**
 * @returns handleUpdate useFrameで毎フレーム呼び出す関数
 */
export const useFruid_2 = () => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const [materials, setMeshMaterial] = useMesh(scene);
   const camera = useCamera();
   const updatePointer = usePointer();

   //FBO
   const updateVelocityFBO = useDoubleFBO();
   const updateDensityFBO = useDoubleFBO();
   const updateCurlFBO = useSingleFBO();
   const updateDivergenceFBO = useSingleFBO();
   const updatePressureFBO = useDoubleFBO();

   const unifroms = useMemo(
      () => ({
         divergence: materials.divergenceMaterial.uniforms,
         pressure: materials.pressureMaterial.uniforms,
         curl: materials.curlMaterial.uniforms,
         vorticity: materials.vorticityMaterial.uniforms,
         advection: materials.advectionMaterial.uniforms,
         clear: materials.clearMaterial.uniforms,
         gradientSubtract: materials.gradientSubtractMaterial.uniforms,
         splat: materials.splatMaterial.uniforms,
      }),
      [materials]
   );

   const lastTime = useRef(Date.now());
   /**
    * @returns rederTarget.texture
    */
   const handleUpdate = useCallback((props: RootState) => {
      const { gl, pointer, clock, size } = props;

      /*===============================================
		TODO* clockに修正する
		===============================================*/
      // const dt = Math.min((Date.now() - lastTime.current) / 1000, 0.03);
      const dt = 0.013;
      lastTime.current = Date.now();

      /*===============================================
		advectionを焼き付けて、velocityFBOを更新
		===============================================*/
      const velocityTex = updateVelocityFBO(gl, ({ read }) => {
         setMeshMaterial(materials.advectionMaterial);
         unifroms.advection.uVelocity.value = read;
         unifroms.advection.uSource.value = read;
         unifroms.advection.dt.value = dt;
         unifroms.advection.dissipation.value = 0.99;
         gl.render(scene, camera.current);
      });

      /*===============================================
      advectionを焼きつけて、densityFBOを更新
      ===============================================*/
      const densityTex = updateDensityFBO(gl, ({ read }) => {
         setMeshMaterial(materials.advectionMaterial);
         unifroms.advection.uVelocity.value = velocityTex;
         unifroms.advection.uSource.value = read;
         unifroms.advection.dissipation.value = 0.98;
         gl.render(scene, camera.current);
      });

      /*===============================================
      マウスでsplat処理
		//TODO*　unifroms.splat.color.valueの部分が多分おかしいので修正
		多分、0~1で正規化できてないとかかな？
      ===============================================*/
      const { currentPointer, prevPointer, isVelocityUpdate, velocity } =
         updatePointer(pointer);

      if (isVelocityUpdate) {
         updateVelocityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.splatMaterial);
            unifroms.splat.uTarget.value = read;
            unifroms.splat.point.value = currentPointer;
            unifroms.splat.color.value = new THREE.Vector3(
               velocity.x * size.width * 100.0,
               velocity.y * size.height * 100.0,
               1.0
            );
            // unifroms.splat.color.value = new THREE.Vector3(
            //    currentPointer.x - prevPointer.x * size.width * 10.0,
            //    currentPointer.y - prevPointer.y * size.height * -10.0,
            //    1.0
            // );
            unifroms.splat.radius.value = 0.004;
            gl.render(scene, camera.current);
         });
         updateDensityFBO(gl, ({ read }) => {
            setMeshMaterial(materials.splatMaterial);
            unifroms.splat.uTarget.value = read;
            unifroms.splat.color.value = new THREE.Vector3(1.0, 1.0, 1.0); //ここ一旦適当、多分ここが最終出力されるカラーになるので、速度に比例させたり？
            gl.render(scene, camera.current);
         });
      }

      /*===============================================
      curlを焼きつけて、curlのFBOを更新（シングル）
      ===============================================*/
      const curlTex = updateCurlFBO(gl, () => {
         setMeshMaterial(materials.curlMaterial);
         unifroms.curl.uVelocity.value = velocityTex;
         gl.render(scene, camera.current);
      });

      /*===============================================
      vorticityを焼き付けて、velocityを更新
      ===============================================*/
      updateVelocityFBO(gl, ({ read }) => {
         setMeshMaterial(materials.vorticityMaterial);
         unifroms.vorticity.uVelocity.value = read;
         unifroms.vorticity.uCurl.value = curlTex;
         unifroms.vorticity.curl.value = 28;
         unifroms.vorticity.dt.value = dt;
         gl.render(scene, camera.current);
      });

      /*===============================================
      divergenceを焼き付けて、divergenveを更新
      ===============================================*/
      const divergenceTex = updateDivergenceFBO(gl, () => {
         setMeshMaterial(materials.divergenceMaterial);
         unifroms.divergence.uVelocity.value = velocityTex;
         gl.render(scene, camera.current);
      });

      /*===============================================
      clearを焼き付けて、pressureを更新
      ===============================================*/
      updatePressureFBO(gl, ({ read }) => {
         setMeshMaterial(materials.clearMaterial);
         unifroms.clear.uTexture.value = read;
         unifroms.clear.value.value = 0.8;
         gl.render(scene, camera.current);
      });

      /*===============================================
      pressureを焼き付けて、ヤコビ法でpuressureを計算
      ===============================================*/
      setMeshMaterial(materials.pressureMaterial);
      unifroms.pressure.uDivergence.value = divergenceTex;

      let pressureTexTemp: THREE.Texture;
      for (let i = 0; i < 25; i++) {
         pressureTexTemp = updatePressureFBO(gl, ({ read }) => {
            unifroms.pressure.uPressure.value = read;
            gl.render(scene, camera.current);
         });
      }

      /*===============================================
      gradienSubtractを焼き付けて、veloityを更新
      ===============================================*/
      updateVelocityFBO(gl, ({ read }) => {
         setMeshMaterial(materials.gradientSubtractMaterial);
         unifroms.gradientSubtract.uPressure.value = pressureTexTemp;
         unifroms.gradientSubtract.uVelocity.value = read;
         gl.render(scene, camera.current);
      });

      /*===============================================
      dnsityを返す
      ===============================================*/
      return densityTex;
   }, []);
   return handleUpdate;
};

/*===============================================
advection
curl カール
vorticity 渦巻き
pressure
===============================================*/

/*===============================================
TODO*気が向いたら、ランダムモードつくる
===============================================*/
