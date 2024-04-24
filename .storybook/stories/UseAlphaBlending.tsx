import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import {
   useAlphaBlending,
   useMarble,
   useBrush,
} from "../../packages/use-shader-fx/src";
import {
   ALPHABLENDING_PARAMS,
   AlphaBlendingParams,
} from "../../packages/use-shader-fx/src/fxs/utils/useAlphaBlending";

extend({ FxMaterial });

const CONFIG: AlphaBlendingParams = structuredClone(ALPHABLENDING_PARAMS);
const setGUI = (gui: GUI) => {};
const setConfig = () => {
   return {
      ...CONFIG,
   } as AlphaBlendingParams;
};

export const UseAlphaBlending = (args: AlphaBlendingParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [updateBrush, setBrush, { output: brush }] = useBrush({
      size,
      dpr,
   });
   const [update, set, { output }] = useAlphaBlending({
      size,
      dpr,
   });
   const [updateMarble, setMarble, { output: marble }] = useMarble({
      size,
      dpr,
   });

   set({
      texture: marble,
      map: brush,
   });

   useFrame((props) => {
      updateBrush(props);
      updateMarble(props);
      update(props);
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
