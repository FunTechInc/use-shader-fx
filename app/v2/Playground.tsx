"use client";

import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import { useNoise, useFluid } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import { Float, OrbitControls, useVideoTexture } from "@react-three/drei";

/*===============================================
# webglooの設計

- useFxResolverでhookを切り替える
===============================================*/

extend({ FxMaterial });

// ここに渡すstateでレンダリングを切り替える
const useFxResolver = (test: boolean) => {
   if (test) {
      return useNoise;
   } else {
      return useFluid;
   }
};

export const Playground = () => {
   const { size } = useThree();

   // const currentHook = useFxResolver(true);
   // const noise = currentHook({
   //    size,
   //    dpr: 0.15,
   // });

   // const fluid = useFluid({
   //    size,
   //    dpr: 0.5,
   // });

   const funkun_mov = useVideoTexture("/FT_Ch02-comp.mp4", {
      width: 1280,
      height: 720,
   });

   const [gear] = useLoader(THREE.TextureLoader, [
      "/stickers/webp/sticker2.webp",
   ]);

   const noise = useNoise({
      size,
      dpr: 0.1,
      fxBlending: true,
      fxBlendingSrc: gear,
      alphaBlending: 1,
      uvBlending: 0.1,
      fxBlendingSrcResolution: new THREE.Vector2(1024, 1024),
   });

   // noise.material.warp = new THREE.Vector2(2.0, 2.0);

   // noise.material.onBeforeCompile = useCallback((shader) => {
   //    console.log(shader.vertexShader);
   // }, []);

   // const material = useMemo(() => {
   //    const _mat = new THREE.MeshPhysicalMaterial();
   //    _mat.color = new THREE.Color("red");
   //    _mat.roughness = 1;
   //    return _mat;
   // }, []);
   // const mesh = useRef<THREE.Mesh>(null);

   useFrame((state) => {
      // fluid.render(state);
      noise.render(state);
      // material.color = new THREE.Color(
      //    Math.sin(state.clock.getElapsedTime()),
      //    1,
      //    1
      // );
      // mesh.current!.rotation.x += 0.01;
      // mesh.current!.rotation.y += 0.01;
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial u_fx={noise.texture} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
