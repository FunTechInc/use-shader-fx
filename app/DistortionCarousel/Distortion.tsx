import * as THREE from "three";
import { Canvas, useFrame, ThreeElements, useLoader } from "@react-three/fiber";

import vertexShader from "./shader/main.vert";
import fragmentSahder from "./shader/main.frag";
import { useRef } from "react";

/*===============================================
定数
===============================================*/
//背景テクスチャーのアスペクト比
const TEXTURE_RATIO = {
   x: 492,
   y: 390,
};

export const Distortion = () => {
   const ref = useRef<any>();

   const [noiseTexture, bgTexure0, bgTexure1] = useLoader(THREE.TextureLoader, [
      "noiseTexture.png",
      "sample.jpg",
      "sample2.jpg",
   ]);

   useFrame(({ clock }) => {
      const a = clock.getElapsedTime();
      if (ref.current?.uniforms?.u_time) {
         ref.current.uniforms.u_time.value = a;
      }
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
               u_noiseStrength: { value: 0.1 },
               u_time: { value: 0 },
               u_trans: { value: 0 },
            }}
            vertexShader={vertexShader}
            fragmentShader={fragmentSahder}
         />
      </mesh>
   );
};
