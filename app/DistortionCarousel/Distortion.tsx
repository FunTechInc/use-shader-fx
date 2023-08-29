import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { useWindowResizeObserver } from "@funtech-inc/spice";
import vertexShader from "./shader/main.vert";
import fragmentSahder from "./shader/main.frag";
import { distortionState, TEXTURE_RATIO } from "./store";
import { useSetGUI } from "./hooks/setGUI";
import { useAppStore } from "../_context/useAppStore";

export const Distortion = () => {
   const ref = useRef<any>();

   //set GUI
   const guiUpdater = useSetGUI();

   //load texture
   //React.Suspenseに基づいてるので、エラーハンドリングやフォールバックは親レベル
   //useLoaderがpromiseをthrowしてる感じ
   const [noiseTexture, bgTexure0, bgTexure1] = useLoader(THREE.TextureLoader, [
      "noiseTexture.jpg",
      "sample.jpg",
      "sample2.jpg",
   ]);

   //call frame
   useFrame(({ clock, mouse }) => {
      const tick = clock.getElapsedTime();
      const uniforms = ref.current?.uniforms;
      if (uniforms) {
         // update tick
         uniforms.u_time.value = tick;
         // update noise
         uniforms.u_noiseStrength.value = distortionState.noiseStrength;
         // update progress
         uniforms.u_progress.value = distortionState.progress;
         uniforms.u_progress2.value = distortionState.progress2;
         // GUIの更新（guiの外で更新されたときにGUIを同期させる）
         guiUpdater();
      }
   });

   //window resize
   useWindowResizeObserver({
      callback: ({ winW, winH }) => {
         if (ref.current?.uniforms) {
            ref.current.uniforms.u_resolution.value = new THREE.Vector2(
               winW,
               winH
            );
         }
      },
      debounce: 50,
      dependencies: [],
   });

   // グローバルの状態管理
   // zustandのselectorのsubscribeを使って、stateの変更をsubscribeする
   // frameを毎回呼び出さない、かつ別コンポーネントからグローバルに操作したいような状態管理用
   useEffect(() => {
      const unsubscribe = useAppStore.subscribe(
         (state) => state.distortionTexture,
         (state) => {
            const uniforms = ref.current?.uniforms;
            if (uniforms) {
               uniforms.u_noiseTexture.value = state.noise ?? noiseTexture;
               uniforms.u_bgTexture0.value = state.bg0 ?? bgTexure0;
               uniforms.u_bgTexture1.value = state.bg1 ?? bgTexure1;
            }
         },
         {
            fireImmediately: true,
         }
      );
      return () => {
         unsubscribe();
      };
   }, [noiseTexture, bgTexure0, bgTexure1]);

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <rawShaderMaterial
            ref={ref}
            uniforms={{
               u_resolution: {
                  value: new THREE.Vector2(
                     window.innerWidth,
                     window.innerHeight
                  ),
               },
               u_imageResolution: {
                  value: new THREE.Vector2(TEXTURE_RATIO.x, TEXTURE_RATIO.y),
               },
               u_noiseTexture: { value: noiseTexture },
               u_bgTexture0: { value: bgTexure0 },
               u_bgTexture1: { value: bgTexure1 },
               u_noiseStrength: { value: distortionState.noiseStrength },
               u_progress: { value: distortionState.progress },
               u_progress2: { value: distortionState.progress2 },
               u_time: { value: 0 },
               u_mouse: { value: new THREE.Vector2(0,0) }
            }}
            vertexShader={vertexShader}
            fragmentShader={fragmentSahder}
         />
      </mesh>
   );
};
