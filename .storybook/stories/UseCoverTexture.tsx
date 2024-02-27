import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useCoverTexture } from "../../packages/use-shader-fx/src";
import {
   COVERTEXTURE_PARAMS,
   CoverTextureParams,
} from "../../packages/use-shader-fx/src/fxs/utils/useCoverTexture";

extend({ FxMaterial });

const CONFIG: CoverTextureParams = structuredClone(COVERTEXTURE_PARAMS);
const setGUI = (gui: GUI) => {};
const setConfig = () => {
   return {
      ...CONFIG,
   } as CoverTextureParams;
};

/** The hook with `~~Texutre` calculates the texture resolution and canvas resolution and covers the texture. */
export const UseCoverTexture = (args: CoverTextureParams) => {
   const [bg] = useLoader(THREE.TextureLoader, ["/momo.jpg"]);
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [update, set, { output }] = useCoverTexture({ size, dpr });

   set({
      texture: bg,
   });

   useFrame((props) => {
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
