import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import {
   useSimpleBlur,
   useFxTexture,
   useCoverTexture,
} from "../../packages/use-shader-fx/src";
import {
   SimpleBlurParams,
   SIMPLEBLUR_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/effects/useSimpleBlur";

extend({ FxMaterial });

const CONFIG: SimpleBlurParams = structuredClone(SIMPLEBLUR_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "blurSize", 0, 10, 0.01);
   gui.add(CONFIG, "blurPower", 0, 10, 1);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as SimpleBlurParams;
};

export const UseSimpleBlur = (args: SimpleBlurParams) => {
   const updateGUI = useGUI(setGUI);
   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);

   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [updateSimpleBlur] = useSimpleBlur({ size, dpr });

   const [updateCover, setCover, { output: cover }] = useCoverTexture({
      size,
      dpr,
   });

   setCover({
      texture: bg,
   });

   useFrame((props) => {
      updateCover(props);
      const fx = updateSimpleBlur(props, {
         ...setConfig(),
         texture: cover,
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
