import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useHSV, useCoverTexture } from "../../packages/use-shader-fx/src";
import {
   HSV_PARAMS,
   HSVParams,
} from "../../packages/use-shader-fx/src/fxs/utils/useHSV";

extend({ FxMaterial });

const CONFIG: HSVParams = structuredClone(HSV_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "brightness", 0, 10, 0.01);
   gui.add(CONFIG, "saturation", 0, 10, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as HSVParams;
};

export const UseHSV = (args: HSVParams) => {
   const [bg] = useLoader(THREE.TextureLoader, ["/momo.jpg"]);
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [updateCover, setCover, { output: cover }] = useCoverTexture({
      size,
      dpr,
   });
   const [update, set, { output }] = useHSV({ size, dpr });

   setCover({
      texture: bg,
   });

   useFrame((props) => {
      updateCover(props);
      update(props, {
         ...setConfig(),
         texture: cover,
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
