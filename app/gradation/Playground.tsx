"use client";

import * as THREE from "three";
import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   useNoise,
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

function useDownloadCanvas() {
   const { gl } = useThree();
   const downloadImage = useCallback(
      (filename = "image.png") => {
         const image = gl.domElement.toDataURL("image/png");
         const link = document.createElement("a");
         link.download = filename;
         link.href = image;
         link.click();
         link.remove();
      },
      [gl]
   );
   return downloadImage;
}

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();

   const saveImage = useDownloadCanvas();
   useEffect(() => {
      CONFIG.save = saveImage;
      CONFIG.random();
   }, [saveImage]);
   useGUI(setGUI);

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
      timeStrength: 0,
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

   useFrame((props) => {
      updateNoise(props);
      updateColorStrata(props, {
         ...(setConfig("colorStrata") as ColorStrataParams),
      });
      updateHSV(props, {
         ...(setConfig("hsv") as HSVParams),
      });
      updateMarble(props, {
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
            u_grain={noise}
            u_colorStrata={hsv}
            ref={ref}
         />
      </mesh>
   );
};
