import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import {
   useChromaKey,
   useCoverTexture,
} from "../../packages/use-shader-fx/src";
import {
   CHROMAKEY_PARAMS,
   ChromaKeyParams,
} from "../../packages/use-shader-fx/src/fxs/misc/useChromaKey";

extend({ FxMaterial });

const CONFIG: ChromaKeyParams = structuredClone(CHROMAKEY_PARAMS);
const setGUI = (gui: GUI) => {
   gui.addColor(CONFIG, "keyColor");
   gui.add(CONFIG, "similarity", 0, 1, 0.01);
   gui.add(CONFIG, "smoothness", 0, 1, 0.01);
   gui.add(CONFIG, "spill", 0, 1, 0.01);
   gui.addColor(CONFIG, "color");
   gui.add(CONFIG, "contrast", 0, 2, 0.01);
   gui.add(CONFIG, "brightness", 0, 2, 0.01);
   gui.add(CONFIG, "gamma", 0, 2, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as ChromaKeyParams;
};

export const UseChromaKey = (args: ChromaKeyParams) => {
   const updateGUI = useGUI(setGUI);
   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [update, set, { output }] = useChromaKey({ size, dpr });

   const [updateCover, setCover, { output: cover }] = useCoverTexture({
      size,
      dpr,
   });

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
