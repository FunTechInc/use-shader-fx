import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import {
   FxTextureMaterial,
   TFxTextureMaterial,
} from "../../utils/fxTextureMaterial";
import { FxMaterial, TFxMaterial } from "../../utils/fxMaterial";
import { useNoise, useTransitionBg } from "../../packages/use-shader-fx/src";
import {
   NoiseParams,
   NOISE_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useNoise";
import { CONSTANT } from "../constant";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";

extend({ FxMaterial, FxTextureMaterial });

// GUI
const CONFIG: NoiseParams = NOISE_PARAMS;
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "timeStrength", 0, 10, 0.01);
   gui.add(CONFIG, "noiseOctaves", 0, 10, 1);
   gui.add(CONFIG, "fbmOctaves", 0, 10, 1);
};
const setConfig = () => {
   return {
      timeStrength: CONFIG.timeStrength,
      noiseOctaves: CONFIG.noiseOctaves,
      fbmOctaves: CONFIG.fbmOctaves,
   } as NoiseParams;
};

/**
 * noise 単体で使うというよりは、他のhookのnoiseに渡す感じで使いましょう！fxの重ねがけをするときに、noiseの計算を一度にするためです。
 */
export const UseNoise = (args: NoiseParams) => {
   const updateGUI = useGUI(setGUI);

   const fxRef = React.useRef<TFxMaterial>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateNoise] = useNoise({ size, dpr });

   useFrame((props) => {
      const fx = updateNoise(props, setConfig());
      fxRef.current!.u_fx = fx;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};

export const UseNoiseWithTexture = (args: NoiseParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<TFxTextureMaterial>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateNoise] = useNoise({ size, dpr });

   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);
   const [updateTransitionBg] = useTransitionBg({ size, dpr });

   useFrame((props) => {
      const bgTexture = updateTransitionBg(props, {
         imageResolution: CONSTANT.imageResolution,
         texture0: bg,
      });

      const fx = updateNoise(props, setConfig());

      fxRef.current!.u_postFx = bgTexture;
      fxRef.current!.u_fx = fx;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxTextureMaterial key={FxTextureMaterial.key} ref={fxRef} />
      </mesh>
   );
};
