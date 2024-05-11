"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   useColorStrata,
   useMarble,
   useHSV,
   ColorStrataParams,
   HSVParams,
   MarbleParams,
} from "@/packages/use-shader-fx/src";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { CONFIG as HomeConfig } from "../_home/Playground";
import { useDownloadCanvas } from "@/utils/useDownloadCanvas";

extend({ FxMaterial });

const CONFIG = {
   ...HomeConfig,
   save: () => {},
};
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "random").name("Randomize");
   gui.add(CONFIG, "save").name("Save");
};

const setConfig = (key: "marble" | "colorStrata" | "hsv") => {
   return {
      ...CONFIG[key],
   };
};

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();

   const saveImage = useDownloadCanvas();

   useMemo(() => {
      CONFIG.save = saveImage;
      CONFIG.random();
   }, [saveImage]);
   useGUI(setGUI);

   const { size, viewport } = useThree();

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

   setMarble({
      ...setConfig("marble"),
      timeStrength: 0,
   });

   setColorStrata({
      ...setConfig("colorStrata"),
      timeStrength: new THREE.Vector2(0, 0),
   });

   setHSV({
      ...setConfig("hsv"),
      texture: colorStrata,
   });

   useFrame((state) => {
      updateColorStrata(state, {
         ...(setConfig("colorStrata") as ColorStrataParams),
      });
      updateHSV(state, {
         ...(setConfig("hsv") as HSVParams),
      });
      updateMarble(state, {
         ...(setConfig("marble") as MarbleParams),
      });
      ref.current!.u_noiseIntensity = CONFIG.noiseIntensity;
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial
            key={FxMaterial.key}
            u_noise={marble}
            u_colorStrata={hsv}
            ref={ref}
         />
      </mesh>
   );
};
