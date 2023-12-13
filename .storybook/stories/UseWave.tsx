import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import { CONSTANT } from "../constant";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useWave, useFxTexture } from "../../packages/use-shader-fx/src";
import {
   WAVE_PARAMS,
   WaveParams,
} from "../../packages/use-shader-fx/src/hooks/useWave";

extend({ FxMaterial });

const CONFIG = {
   ...structuredClone(WAVE_PARAMS),
   epicenter: {
      vec2: new THREE.Vector2(0.0, 0.0),
      x: 0.0,
      y: 0.0,
   },
};
const setGUI = (gui: GUI) => {
   gui.add(CONFIG.epicenter, "x", -1, 1, 0.1);
   gui.add(CONFIG.epicenter, "y", -1, 1, 0.1);
   gui.add(CONFIG, "progress", 0, 1, 0.1);
   gui.add(CONFIG, "width", 0, 1, 0.1);
   gui.add(CONFIG, "strength", 0, 1, 0.1);
   gui.add(CONFIG, "mode", ["center", "horizontal", "vertical"]);
};
const setConfig = () => {
   return {
      epicenter: CONFIG.epicenter.vec2.set(
         CONFIG.epicenter.x,
         CONFIG.epicenter.y
      ),
      progress: CONFIG.progress,
      width: CONFIG.width,
      strength: CONFIG.strength,
      mode: CONFIG.mode,
   } as WaveParams;
};

export const UseWave = (args: WaveParams) => {
   const updateGUI = useGUI(setGUI);

   const fxRef = React.useRef<FxMaterialProps>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateWave] = useWave({ size, dpr });

   useFrame((props) => {
      const fx = updateWave(props, setConfig());
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

export const UseWaveWithTexture = (args: WaveParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);

   const [updateWave] = useWave({ size, dpr });
   const [updateFxTexture] = useFxTexture({ size, dpr });

   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);

   useFrame((props) => {
      const fx = updateWave(props, setConfig());

      const bgTexture = updateFxTexture(props, {
         map: fx,
         padding: 0.2,
         mapIntensity: 0.5,
         edgeIntensity: 0.5,
         textureResolution: CONSTANT.textureResolution,
         texture0: bg,
      });

      fxRef.current!.u_fx = bgTexture;
      fxRef.current!.u_alpha = 0.0;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};
