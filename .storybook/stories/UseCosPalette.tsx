import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import { CONSTANT } from "../constant";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useCosPalette, useFxTexture } from "../../packages/use-shader-fx/src";
import {
   CosPaletteParams,
   COSPALETTE_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useCosPalette";

extend({ FxMaterial });

const CONFIG: CosPaletteParams = structuredClone(COSPALETTE_PARAMS);
const setGUI = (gui: GUI) => {
   gui.addColor(CONFIG, "color1");
   gui.addColor(CONFIG, "color2");
   gui.addColor(CONFIG, "color3");
   gui.addColor(CONFIG, "color4");
   gui.add(CONFIG.rgbWeight!, "x", 0, 1, 0.299);
   gui.add(CONFIG.rgbWeight!, "y", 0, 1, 0.587);
   gui.add(CONFIG.rgbWeight!, "z", 0, 1, 0.114);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as CosPaletteParams;
};


export const UseCosPalette = (args: CosPaletteParams) => {
   const updateGUI = useGUI(setGUI);
   const [bg] = useLoader(THREE.TextureLoader, ["momo.jpg"]);

   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateCosPalette] = useCosPalette({ size, dpr });
   const [updateFxTexture, setFxTexture] = useFxTexture({ size, dpr });

   setFxTexture({ 
      textureResolution: CONSTANT.textureResolution,
      texture0: bg,
   });

   useFrame((props) => {
      const tex = updateFxTexture(props);
      const fx = updateCosPalette(props, {
         ...setConfig(),
         texture: tex,
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
