"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   useNoise,
   useColorStrata,
   useMarble,
   useHSV,
} from "@/packages/use-shader-fx/src";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";

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
      brightness: 1.5,
      saturation: 0.4,
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
         Math.random(),
         Math.random()
      );
      CONFIG.colorStrata.laminateDetail = new THREE.Vector2(
         Math.random(),
         Math.random()
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
      CONFIG.hsv.brightness = Math.max(Math.random() * 3, 0.1);
      CONFIG.hsv.saturation = Math.random() * 3;
      CONFIG.noiseIntensity = Math.random() * 10;
   },
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
   const downloadImage = (filename = "image.png") => {
      const image = gl.domElement.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = filename;
      link.href = image;
      link.click();
      link.remove();
   };
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
         ...(setConfig("colorStrata") as any),
      });
      updateHSV(props, {
         ...(setConfig("hsv") as any),
      });
      updateMarble(props, {
         ...(setConfig("marble") as any),
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
