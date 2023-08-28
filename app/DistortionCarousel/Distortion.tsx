import * as THREE from "three";
import { Canvas, useFrame, ThreeElements, useLoader } from "@react-three/fiber";
import { useWindowResizeObserver } from "@funtech-inc/spice";
import vertexShader from "./shader/main.vert";
import fragmentSahder from "./shader/main.frag";
import { memo, useEffect, useMemo, useRef } from "react";
import { GUIController } from "./gui";

//背景テクスチャーのアスペクト比
const TEXTURE_RATIO = {
   x: 512,
   y: 512,
};

//GUIで操作するために関数外に出してる
const distortionState = {
   noiseStrength: 0,
   progress: 0,
};

export const Distortion = () => {
   const ref = useRef<any>();

   //set GUI
   const gui = GUIController.instance;
   gui.addNumericSlider(distortionState, "noiseStrength", 0, 1, 0.01);
   gui.addNumericSlider(distortionState, "progress", 0, 1, 0.01);

   //load texture
   const [noiseTexture, bgTexure0, bgTexure1] = useLoader(THREE.TextureLoader, [
      "noiseTexture.jpg",
      "sample.jpg",
      "sample2.jpg",
   ]);

   //call frame
   useFrame(({ clock }) => {
      const tick = clock.getElapsedTime();
      if (ref.current?.uniforms) {
         ref.current.uniforms.u_time.value = tick;
         ref.current.uniforms.u_noiseStrength.value =
            distortionState.noiseStrength;
         ref.current.uniforms.u_progress.value = distortionState.progress;
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
               u_time: { value: 0 },
            }}
            vertexShader={vertexShader}
            fragmentShader={fragmentSahder}
         />
      </mesh>
   );
};
