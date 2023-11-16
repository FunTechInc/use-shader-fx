import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import { CONSTANT } from "../constant";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useTransitionBg, useNoise } from "../../packages/use-shader-fx/src";
import {
   TransitionBgParams,
   TRANSITIONBG_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useTransitionBg";

extend({ FxMaterial });

const CONFIG: TransitionBgParams = structuredClone(TRANSITIONBG_PARAMS);
const DIR = new THREE.Vector2(0, 0);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "noiseStrength", 0, 1, 0.01);
   gui.add(CONFIG, "progress", 0, 1, 0.01);
   gui.add(DIR, "x", -1, 1, 0.01);
   gui.add(DIR, "y", -1, 1, 0.01);
};
const setConfig = () => {
   return {
      noiseStrength: CONFIG.noiseStrength,
      progress: CONFIG.progress,
      dir: DIR,
   } as TransitionBgParams;
};

/**
 * Transition the two background textures using the progress value. Noise can also be added
 */
export const UseTransitionBg = (args: TransitionBgParams) => {
   const updateGUI = useGUI(setGUI);
   const [bg, momo] = useLoader(THREE.TextureLoader, [
      "thumbnail.jpg",
      "momo.jpg",
   ]);
   const fxRef = React.useRef<FxMaterialProps>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateTransitionBg] = useTransitionBg({ size, dpr });
   const [updateNoise] = useNoise({ size, dpr });

   useFrame((props) => {
      const noise = updateNoise(props);
      const fx = updateTransitionBg(props, {
         noiseMap: noise,
         imageResolution: CONSTANT.imageResolution,
         texture0: bg,
         texture1: momo,
         ...setConfig(),
      });
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
