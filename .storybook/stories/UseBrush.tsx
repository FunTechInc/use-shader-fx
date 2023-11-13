import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, TFxMaterial } from "../../utils/fxMaterial";
import { useBrush, useTransitionBg } from "../../packages/use-shader-fx/src";
import {
   BrushParams,
   BRUSH_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useBrush";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { CONSTANT } from "../constant";

extend({ FxMaterial });

// GUI
const CONFIG: BrushParams = BRUSH_PARAMS;
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "radius", 0, 0.1, 0.01);
   gui.add(CONFIG, "smudge", 0, 10, 0.01);
   gui.add(CONFIG, "dissipation", 0, 1, 0.01);
   gui.add(CONFIG, "motionBlur", 0, 10, 0.01);
   gui.add(CONFIG, "motionSample", 0, 20, 1);
   gui.addColor(CONFIG, "color");
};
const setConfig = () => {
   return {
      radius: CONFIG.radius,
      smudge: CONFIG.smudge,
      dissipation: CONFIG.dissipation,
      motionBlur: CONFIG.motionBlur,
      motionSample: CONFIG.motionSample,
      color: CONFIG.color,
   } as BrushParams;
};

/**
 * ブラシ
 */
export const UseBrush = (args: BrushParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<TFxMaterial>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateBrush] = useBrush({ size, dpr });
   useFrame((props) => {
      const fx = updateBrush(props, {
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

export const UseBrushWithTexture = (args: BrushParams) => {
   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<TFxMaterial>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateTransitionBg] = useTransitionBg({ size, dpr });
   const [updateBrush] = useBrush({ size, dpr });

   useFrame((props) => {
      const bgTexture = updateTransitionBg(props, {
         imageResolution: CONSTANT.imageResolution,
         texture0: bg,
      });
      const fx = updateBrush(props, {
         texture: bgTexture,
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
