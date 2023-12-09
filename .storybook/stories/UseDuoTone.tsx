import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import { CONSTANT } from "../constant";
import { useDuoTone, useTransitionBg } from "../../packages/use-shader-fx/src";
import {
   DuoToneParams,
   DUOTONE_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useDuoTone";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";

extend({ FxMaterial });

const CONFIG: DuoToneParams = structuredClone(DUOTONE_PARAMS);
const setGUI = (gui: GUI) => {
   gui.addColor(CONFIG, "color0");
   gui.addColor(CONFIG, "color1");
};
const setConfig = () => {
   return {
      color0: CONFIG.color0,
      color1: CONFIG.color1,
   } as DuoToneParams;
};

export const UseDuoTone = (args: DuoToneParams) => {
   const updateGUI = useGUI(setGUI);
   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);
   const fxRef = React.useRef<FxMaterialProps>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateTransitionBg] = useTransitionBg({ size, dpr });
   const [updateDuoTone] = useDuoTone({ size, dpr });

   useFrame((props) => {
      const bgTexture = updateTransitionBg(props, {
         textureResolution: CONSTANT.textureResolution,
         texture0: bg,
      });
      const fx = updateDuoTone(props, {
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
