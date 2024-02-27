import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useFxTexture, useNoise } from "../../packages/use-shader-fx/src";
import {
   FxTextureParams,
   FXTEXTURE_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/utils/useFxTexture";

extend({ FxMaterial });

const CONFIG: FxTextureParams = structuredClone(FXTEXTURE_PARAMS);

const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "mapIntensity", 0, 10, 0.1);
   gui.add(CONFIG, "edgeIntensity", 0, 10, 0.1);
   const epicenter = gui.addFolder("epicenter");
   epicenter.add(CONFIG.epicenter!, "x", -1, 1, 0.1);
   epicenter.add(CONFIG.epicenter!, "y", -1, 1, 0.1);
   gui.add(CONFIG, "progress", 0, 1, 0.01);
   const dir = gui.addFolder("dir");
   dir.add(CONFIG.dir!, "x", -1, 1, 0.01);
   dir.add(CONFIG.dir!, "y", -1, 1, 0.01);
   gui.add(CONFIG, "padding", 0, 0.3, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as FxTextureParams;
};

/**
 * Textures can be affected by a map; it is also possible to transition between two textures. If the resolution of texture0 and texture1 is different, it is linearly interpolated according to the value of progress
 *
 * ※ The hook with `~~Texutre` calculates the texture resolution and canvas resolution and covers the texture.
 */
export const UseFxTexture = (args: FxTextureParams) => {
   const updateGUI = useGUI(setGUI);
   const [bg, momo] = useLoader(THREE.TextureLoader, [
      "app-head.jpg",
      "momo.jpg",
   ]);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateFxTexture] = useFxTexture({ size, dpr });
   const [updateNoise] = useNoise({ size, dpr });

   useFrame((props) => {
      const noise = updateNoise(props);
      const fx = updateFxTexture(props, {
         ...setConfig(),
         map: noise,
         texture0: bg,
         texture1: momo,
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
