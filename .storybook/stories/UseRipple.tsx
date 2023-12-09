import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import {
   FxTextureMaterial,
   FxTextureMaterialProps,
} from "../../utils/fxTextureMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { CONSTANT } from "../constant";
import { useRipple, useTransitionBg } from "../../packages/use-shader-fx/src";
import {
   RippleParams,
   RIPPLE_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useRipple";

extend({ FxMaterial, FxTextureMaterial });

const CONFIG: RippleParams = structuredClone(RIPPLE_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "frequency", 0, 0.1, 0.01);
   gui.add(CONFIG, "rotation", 0, 1, 0.01);
   gui.add(CONFIG, "fadeout_speed", 0, 0.99, 0.01);
   gui.add(CONFIG, "scale", 0, 1, 0.01);
   gui.add(CONFIG, "alpha", 0, 1, 0.01);
};
const setConfig = () => {
   return {
      frequency: CONFIG.frequency,
      rotation: CONFIG.rotation,
      fadeout_speed: CONFIG.fadeout_speed,
      scale: CONFIG.scale,
      alpha: CONFIG.alpha,
   } as RippleParams;
};

export const UseRipple = (args: RippleParams) => {
   const [ripple] = useLoader(THREE.TextureLoader, ["smoke.png"]);
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const size = useThree((state) => state.size);
   const [updateRipple] = useRipple({ size, texture: ripple });
   useFrame((props) => {
      const fx = updateRipple(props, setConfig());
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

export const UseRippleWithTexture = (args: RippleParams) => {
   const [bg, ripple] = useLoader(THREE.TextureLoader, [
      "thumbnail.jpg",
      "smoke.png",
   ]);
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxTextureMaterialProps>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateTransitionBg] = useTransitionBg({ size, dpr });
   const [updateRipple] = useRipple({ size, texture: ripple });

   useFrame((props) => {
      const bgTexture = updateTransitionBg(props, {
         textureResolution: CONSTANT.textureResolution,
         texture0: bg,
      });
      const fx = updateRipple(props, setConfig());
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
