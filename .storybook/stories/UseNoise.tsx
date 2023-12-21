import * as React from "react";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useNoise } from "../../packages/use-shader-fx/src";
import {
   NoiseParams,
   NOISE_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useNoise";

extend({ FxMaterial });

const CONFIG: NoiseParams = structuredClone(NOISE_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "scale", 0, 10, 0.001);
   gui.add(CONFIG, "timeStrength", 0, 10, 0.01);
   gui.add(CONFIG, "noiseOctaves", 1, 10, 1);
   gui.add(CONFIG, "fbmOctaves", 1, 10, 1);
   gui.add(CONFIG, "warpOctaves", 1, 10, 1);
   gui.add(CONFIG.warpDirection!, "x", 1, 10, 0.1);
   gui.add(CONFIG.warpDirection!, "y", 1, 10, 0.1);
   gui.add(CONFIG, "warpStrength", 1, 50, 0.1);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as NoiseParams;
};

/**
 * Rather than using noise alone, use it by passing it to noise of another hook! This is to calculate noise at once when overlapping fx.
 */
export const UseNoise = (args: NoiseParams) => {
   const updateGUI = useGUI(setGUI);

   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
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
