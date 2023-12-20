import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import {
   useNoise,
   useBrightnessPicker,
} from "../../packages/use-shader-fx/src";
import {
   BrightnessPickerParams,
   BRIGHTNESSPICKER_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useBrightnessPicker";

extend({ FxMaterial });

const CONFIG = {
   ...structuredClone(BRIGHTNESSPICKER_PARAMS),
   r: 0.5,
   g: 0.5,
   b: 0.5,
};
const brightness = new THREE.Vector3(CONFIG.r, CONFIG.g, CONFIG.b);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "r", 0, 1, 0.01);
   gui.add(CONFIG, "g", 0, 1, 0.01);
   gui.add(CONFIG, "b", 0, 1, 0.01);
   gui.add(CONFIG, "min", 0, 1, 0.01);
   gui.add(CONFIG, "max", 0, 1, 0.01);
};
const setConfig = () => {
   return {
      brightness: brightness.set(CONFIG.r, CONFIG.g, CONFIG.b),
      min: CONFIG.min,
      max: CONFIG.max,
   } as BrightnessPickerParams;
};

/**
 * Blending the texture passed as map
 */
export const UseBrightnessPicker = (args: BrightnessPickerParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [updateNoise] = useNoise({ size, dpr });
   const [updateBrightnessPicker] = useBrightnessPicker({ size, dpr });

   useFrame((props) => {
      const noise = updateNoise(props);
      const fx = updateBrightnessPicker(props, {
         texture: noise,
         ...setConfig(),
      });
      fxRef.current!.u_fx = fx;
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
