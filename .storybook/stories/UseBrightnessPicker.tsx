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

const CONFIG: BrightnessPickerParams = structuredClone(BRIGHTNESSPICKER_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG.brightness!, "x", 0, 1, 0.01);
   gui.add(CONFIG.brightness!, "y", 0, 1, 0.01);
   gui.add(CONFIG.brightness!, "z", 0, 1, 0.01);
   gui.add(CONFIG, "min", 0, 1, 0.01);
   gui.add(CONFIG, "max", 0, 1, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
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
         ...setConfig(),
         texture: noise,
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
