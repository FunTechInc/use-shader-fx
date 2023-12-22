import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import { CONSTANT } from "../constant";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import {
   useFxBlending,
   useFluid,
   useNoise,
} from "../../packages/use-shader-fx/src";
import {
   FxBlendingParams,
   FXBLENDING_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useFxBlending";

extend({ FxMaterial });

const CONFIG: FxBlendingParams = structuredClone(FXBLENDING_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "mapIntensity", 0, 1, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as FxBlendingParams;
};

/**
 * Blend map to texture. You can change the intensity of fx applied by the rg value of map. Unlike "useBlending", the map color is not reflected.
 */
export const UseFxBlending = (args: FxBlendingParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateFluid] = useFluid({ size, dpr });
   const [updateNoise] = useNoise({ size, dpr });
   const [updateFxBlending] = useFxBlending({ size, dpr });

   useFrame((props) => {
      const noise = updateNoise(props);
      const fluid = updateFluid(props);
      const blending = updateFxBlending(props, {
         ...setConfig(),
         texture: fluid,
         map: noise,
      });
      fxRef.current!.u_fx = blending;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};
