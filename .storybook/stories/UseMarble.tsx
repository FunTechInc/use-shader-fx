import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useMarble } from "../../packages/use-shader-fx/src";
import {
   MARBLE_PARAMS,
   MarbleParams,
} from "../../packages/use-shader-fx/src/fxs/noises/useMarble";

extend({ FxMaterial });

const CONFIG: MarbleParams = structuredClone(MARBLE_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "pattern", 0, 1000, 1);
   gui.add(CONFIG, "complexity", 0, 10, 0.01);
   gui.add(CONFIG, "complexityAttenuation", 0, 2, 0.01);
   gui.add(CONFIG, "iterations", 0, 10, 1);
   gui.add(CONFIG, "timeStrength", 0, 2, 0.01);
   gui.add(CONFIG, "scale", 0, 1, 0.001);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as MarbleParams;
};

export const UseMarble = (args: MarbleParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [update, set, { output }] = useMarble({ size, dpr });

   useFrame((props) => {
      update(props, {
         ...setConfig(),
      });
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial
            key={FxMaterial.key}
            u_fx={output}
            u_alpha={0.0}
            ref={fxRef}
         />
      </mesh>
   );
};
