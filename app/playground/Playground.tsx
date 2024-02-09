"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   useNoise,
   useFluid,
   useFxBlending,
   useColorStrata,
   useBrightnessPicker,
} from "@/packages/use-shader-fx/src";
import {
   NoiseParams,
   NOISE_PARAMS,
} from "@/packages/use-shader-fx/src/hooks/useNoise";
import {
   ColorStrataParams,
   COLORSTRATA_PARAMS,
} from "@/packages/use-shader-fx/src/hooks/useColorStrata";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import { useVideoTexture } from "@react-three/drei";

extend({ FxMaterial });

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();

   const video = useVideoTexture("/gorilla.mov");

   useFrame((props) => {
      ref.current!.u_time = props.clock.getElapsedTime();
   });

   // set resolution
   const { size } = useThree();
   useEffect(() => {
      ref.current!.u_resolution = new THREE.Vector2(size.width, size.height);
   }, [size]);

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial
            key={FxMaterial.key}
            u_texture={video}
            u_keyColor={new THREE.Color(0x7bf43a)}
            u_textureResolution={new THREE.Vector2(1920, 1080)}
            ref={ref}
         />
      </mesh>
   );
};
