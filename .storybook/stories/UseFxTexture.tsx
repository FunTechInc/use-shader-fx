import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import { CONSTANT } from "../constant";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useFxTexture, useNoise } from "../../packages/use-shader-fx/src";
import {
   FxTextureParams,
   FXTEXTURE_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useFxTexture";

extend({ FxMaterial });

const CONFIG: FxTextureParams = structuredClone(FXTEXTURE_PARAMS);
const DIR = new THREE.Vector2(0, 0);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "mapIntensity", 0, 1, 0.01);
   gui.add(CONFIG, "progress", 0, 1, 0.01);
   gui.add(DIR, "x", -1, 1, 0.01);
   gui.add(DIR, "y", -1, 1, 0.01);
};
const setConfig = () => {
   return {
      mapIntensity: CONFIG.mapIntensity,
      progress: CONFIG.progress,
      dir: DIR,
   } as FxTextureParams;
};

/**
 * Textures can be affected by a map; it is also possible to transition between two textures.
 */
export const UseFxTexture = (args: FxTextureParams) => {
   const updateGUI = useGUI(setGUI);
   const [bg, momo] = useLoader(THREE.TextureLoader, [
      "thumbnail.jpg",
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
         map: noise,
         textureResolution: CONSTANT.textureResolution,
         texture0: bg,
         texture1: momo,
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
