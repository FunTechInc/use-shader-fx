"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import {
   useMotionBlur,
   useSimpleBlur,
   MotionBlurParams,
   SimpleBlurParams,
   useHSV,
} from "@/packages/use-shader-fx/src";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { useDownloadCanvas } from "@/utils/useDownloadCanvas";

extend({ FxMaterial });

const CONFIG = {
   motionBlur: {
      begin: {
         x: 0.0,
         y: 0.0,
      },
      end: {
         x: 0.0,
         y: 0.0,
      },
      strength: 0.94,
   },
   simpleBlur: {
      blurSize: 1,
   },
   color: {
      contrast: 1,
      saturation: 0,
      brightness: 1,
   },
   floor: {
      step: 12,
      noise: 0.3,
      x: 0.2,
      y: 0.8,
   },
   random: () => {
      CONFIG.motionBlur.begin.x = Math.random() - 0.5;
      CONFIG.motionBlur.begin.y = Math.random() - 0.5;
      CONFIG.motionBlur.end.x = Math.random() - 0.5;
      CONFIG.motionBlur.end.y = Math.random() - 0.5;
      CONFIG.motionBlur.strength = Math.max(Math.random(), 0.9);
      CONFIG.simpleBlur.blurSize = Math.max(Math.random() * 2, 0.5);
      CONFIG.color.contrast = Math.max(Math.random() * 3, 1);
      CONFIG.color.brightness = Math.max(Math.random() * 3, 1);
   },
   save: () => {},
};
const setGUI = (gui: GUI) => {
   const motionBlur = gui.addFolder("Motion Blur");
   motionBlur.add(CONFIG.motionBlur.begin, "x", -0.5, 0.5, 0.001);
   motionBlur.add(CONFIG.motionBlur.begin, "y", -0.5, 0.5, 0.001);
   motionBlur.add(CONFIG.motionBlur.end, "x", -0.5, 0.5, 0.001);
   motionBlur.add(CONFIG.motionBlur.end, "y", -0.5, 0.5, 0.001);
   motionBlur.add(CONFIG.motionBlur, "strength", 0, 1, 0.01);

   const simpleBlur = gui.addFolder("Simple Blur");
   simpleBlur.add(CONFIG.simpleBlur, "blurSize", 0, 10, 0.01);

   const floor = gui.addFolder("Floor");
   floor.add(CONFIG.floor, "step", 5, 20, 1);
   floor.add(CONFIG.floor, "noise", 0, 2, 0.01);
   floor.add(CONFIG.floor, "x", 0, 2, 0.01);
   floor.add(CONFIG.floor, "y", 0, 2, 0.01);

   const color = gui.addFolder("Color");
   color.add(CONFIG.color, "contrast", 0, 3, 0.01);
   color.add(CONFIG.color, "saturation", 0, 3, 0.01);
   color.add(CONFIG.color, "brightness", 0, 3, 0.01);

   gui.add(CONFIG, "random").name("Randomize");
   gui.add(CONFIG, "save").name("Save");
};

const getConfig = (key: "motionBlur" | "simpleBlur" | "color") => {
   return {
      ...CONFIG[key],
   };
};

export const Playground = ({
   dpr,
   file,
}: {
   dpr: number;
   file: File | null;
}) => {
   const { size } = useThree();
   // file
   const [funkun] = useLoader(THREE.TextureLoader, ["/funkun.jpg"]);
   const [texture, setTexture] = useState<null | THREE.Texture>(funkun);
   useEffect(() => {
      if (file) {
         const url = URL.createObjectURL(file);
         const loader = new THREE.TextureLoader();
         loader.load(url, (loadedTexture) => {
            setTexture(loadedTexture);
            URL.revokeObjectURL(url);
         });
      }
   }, [file]);

   // setGUI
   const saveImage = useDownloadCanvas();
   useEffect(() => {
      CONFIG.save = saveImage;
      CONFIG.random();
   }, [saveImage]);
   const updateGUI = useGUI(setGUI);

   // motion blur
   const [updateMotionBlur, setMotionBlur, { output: motionblur }] =
      useMotionBlur({
         size,
         dpr,
         isSizeUpdate: true,
      });
   setMotionBlur({
      texture: texture || funkun,
   });

   // simple blur
   const [updateBlur, setBlur, { output: blur }] = useSimpleBlur({
      size,
      dpr,
      isSizeUpdate: true,
   });
   setBlur({
      texture: motionblur,
      blurPower: 1,
   });

   // hsv
   const [updateHSV, setHSV, { output: hsv }] = useHSV({
      size,
      dpr,
      isSizeUpdate: true,
   });

   setHSV({
      texture: blur,
   });

   const ref = useRef<FxMaterialProps>(null);

   const motionBlurBegin = useRef(new THREE.Vector2(0, 0));
   const motionBlurEnd = useRef(new THREE.Vector2(0, 0));
   const floorStrength = useRef(new THREE.Vector2(0, 0));

   useFrame((props) => {
      const motionBlur = getConfig("motionBlur") as MotionBlurParams;
      updateMotionBlur(props, {
         strength: motionBlur.strength,
         begin: motionBlurBegin.current.set(
            motionBlur.begin!.x,
            motionBlur.begin!.y
         ),
         end: motionBlurEnd.current.set(motionBlur.end!.x, motionBlur.end!.y),
      });

      updateBlur(props, {
         ...(getConfig("simpleBlur") as SimpleBlurParams),
      });
      updateHSV(props, {
         saturation: CONFIG.color.saturation,
         brightness: CONFIG.color.brightness,
      });
      ref.current!.u_time = props.clock.getElapsedTime();
      ref.current!.u_floor = CONFIG.floor.step;
      ref.current!.u_noiseStrength = CONFIG.floor.noise;
      ref.current!.u_floorStrength = floorStrength.current.set(
         CONFIG.floor.x,
         CONFIG.floor.y
      );
      ref.current!.u_contrast = CONFIG.color.contrast;
      updateGUI();
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial ref={ref} u_fx={hsv} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
//
