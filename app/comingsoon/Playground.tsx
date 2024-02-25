"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   useNoise,
   useColorStrata,
   useMarble,
   useHSV,
   useBeat,
} from "@/packages/use-shader-fx/src";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import { useFBX } from "@react-three/drei";

extend({ FxMaterial });

const CONFIG = {
   marble: {
      pattern: 10,
      complexity: 1.5,
      complexityAttenuation: 0.2,
      scale: 0.002,
   },
   colorStrata: {
      laminateLayer: 6,
      scale: 0.2,
      laminateInterval: new THREE.Vector2(0.55, 0.23),
      laminateDetail: new THREE.Vector2(0, 3.5),
      distortion: new THREE.Vector2(1.64, 4.22),
      colorFactor: new THREE.Vector3(0.6, 0.1, 0),
   },
   hsv: {
      brightness: 0.8,
      saturation: 0.8,
   },
   noiseIntensity: 2,
   random: () => {
      CONFIG.marble.pattern = Math.random() * 1000;
      CONFIG.marble.complexity = Math.random() * 10;
      CONFIG.marble.complexityAttenuation = Math.random();
      CONFIG.marble.scale = Math.random() * 0.001;
      CONFIG.colorStrata.laminateLayer = Math.random() * 100;
      CONFIG.colorStrata.scale = Math.max(Math.random(), 0.1);
      CONFIG.colorStrata.laminateInterval = new THREE.Vector2(
         Math.max(Math.random(), 0.2),
         Math.max(Math.random(), 0.2)
      );
      CONFIG.colorStrata.laminateDetail = new THREE.Vector2(
         Math.random() * 8,
         Math.random() * 8
      );
      CONFIG.colorStrata.distortion = new THREE.Vector2(
         Math.random() * 10,
         Math.random() * 10
      );
      CONFIG.colorStrata.colorFactor = new THREE.Vector3(
         Math.random(),
         Math.random(),
         Math.random()
      );
      CONFIG.noiseIntensity = Math.random() * 10;
   },
   save: () => {},
};

const setConfig = (key: "marble" | "colorStrata" | "hsv") => {
   return {
      ...CONFIG[key],
   };
};

// function FunKun() {
//    let fbx = useFBX("/funkun.fbx");
//    return <primitive object={fbx} scale={0.1} />;
// }

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();

   useEffect(() => {
      CONFIG.random();
   }, []);

   const { size, viewport } = useThree();
   const [updateNoise, setNoise, { output: noise }] = useNoise({
      size,
      dpr: viewport.dpr,
   });
   const [updateColorStrata, setColorStrata, { output: colorStrata }] =
      useColorStrata({ size, dpr: viewport.dpr });
   const [updateMarble, setMarble, { output: marble }] = useMarble({
      size,
      dpr: viewport.dpr,
   });
   const [updateHSV, setHSV, { output: hsv }] = useHSV({
      size,
      dpr: viewport.dpr,
   });

   setNoise({
      scale: 1000,
      warpOctaves: 1,
      noiseOctaves: 1,
      fbmOctaves: 1,
      timeStrength: 1,
   });

   setMarble({
      ...setConfig("marble"),
      timeStrength: 0.5,
   });

   setColorStrata({
      ...setConfig("colorStrata"),
      timeStrength: new THREE.Vector2(0, 0),
   });

   setHSV({
      ...setConfig("hsv"),
      texture: colorStrata,
   });

   const beting = useBeat(110);
   const hashMemo = useRef(0);

   useFrame((props) => {
      const { beat, hash } = beting(props.clock);
      if (hash !== hashMemo.current) {
         hashMemo.current = hash;
         CONFIG.random();
      }
      updateNoise(props);
      updateColorStrata(props, {
         ...(setConfig("colorStrata") as any),
      });
      updateHSV(props, {
         ...(setConfig("hsv") as any),
      });
      updateMarble(props, {
         ...(setConfig("marble") as any),
         beat: beat,
      });
      ref.current!.u_noiseIntensity = CONFIG.noiseIntensity;
   });

   return (
      // <mesh>
      //    <ambientLight />
      //    <pointLight position={[10, 10, 10]} />
      //    <FunKun />
      // </mesh>
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial
            key={FxMaterial.key}
            u_noise={marble}
            u_grain={noise}
            u_colorStrata={hsv}
            ref={ref}
         />
      </mesh>
   );
};
