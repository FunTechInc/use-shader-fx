"use client";

import * as THREE from "three";
import { memo } from "react";
import { Environment } from "@react-three/drei";

export const Background = memo(
   ({
      stickerMap,
      scene,
   }: {
      stickerMap: THREE.Texture;
      scene: THREE.Scene;
   }) => {
      return (
         <>
            <Environment
               frames={1}
               files={"/env/empty_warehouse_01_1k.hdr"}
               environmentIntensity={0.8}
               scene={scene}
            />
            <mesh scale={100}>
               <sphereGeometry args={[3, 32, 32]} />
               <meshBasicMaterial
                  color={new THREE.Color(0x666666)}
                  map={stickerMap}
                  side={THREE.BackSide}
               />
            </mesh>
         </>
      );
   }
);
Background.displayName = "Background";
