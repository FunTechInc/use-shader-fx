import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useColorStrata } from "../../packages/use-shader-fx/src";
import {
   COLORSTRATA_PARAMS,
   ColorStrataParams,
} from "../../packages/use-shader-fx/src/hooks/useColorStrata";

extend({ FxMaterial });

const CONFIG: ColorStrataParams = structuredClone(COLORSTRATA_PARAMS);

const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "laminateLayer", 0, 20, 1);
   gui.add(CONFIG, "scale", 0, 1, 0.01);
   const laminateInterval = gui.addFolder("laminateInterval");
   laminateInterval.add(CONFIG.laminateInterval!, "x", 0, 2, 0.01);
   laminateInterval.add(CONFIG.laminateInterval!, "y", 0, 2, 0.01);
   const laminateDetail = gui.addFolder("laminateDetail");
   laminateDetail.add(CONFIG.laminateDetail!, "x", 0, 10, 0.1);
   laminateDetail.add(CONFIG.laminateDetail!, "y", 0, 10, 0.1);
   const distortion = gui.addFolder("distortion");
   distortion.add(CONFIG.distortion!, "x", 0, 10, 0.01);
   distortion.add(CONFIG.distortion!, "y", 0, 10, 0.01);
   const colorFactor = gui.addFolder("colorFactor");
   colorFactor.add(CONFIG.colorFactor!, "x", 0, 10, 0.01);
   colorFactor.add(CONFIG.colorFactor!, "y", 0, 10, 0.01);
   colorFactor.add(CONFIG.colorFactor!, "z", 0, 10, 0.01);
   const timeStrength = gui.addFolder("timeStrength");
   timeStrength.add(CONFIG.timeStrength!, "x", 0, 2, 0.01);
   timeStrength.add(CONFIG.timeStrength!, "y", 0, 2, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as ColorStrataParams;
};

export const UseColorStrata = (args: ColorStrataParams) => {
   const updateGUI = useGUI(setGUI);

   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateColorStrata] = useColorStrata({ size, dpr });

   useFrame((props) => {
      const fx = updateColorStrata(props, {
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

export const UseColorStrataWithNoise = (args: ColorStrataParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateColorStrata] = useColorStrata({ size, dpr });

   useFrame((props) => {
      const fx = updateColorStrata(props, {
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
