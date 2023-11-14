import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, TFxMaterial } from "../../utils/fxMaterial";
import { CONSTANT } from "../constant";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import {
   useFogProjection,
   useTransitionBg,
   useNoise,
} from "../../packages/use-shader-fx/src";
import {
   FogProjectionParams,
   FOGPROJECTION_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useFogProjection";

extend({ FxMaterial });

const CONFIG: FogProjectionParams = structuredClone(FOGPROJECTION_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "distortionStrength", 0, 1, 0.01);
   gui.add(CONFIG, "fogEdge0", 0, 1, 0.01);
   gui.add(CONFIG, "fogEdge1", 0, 1, 0.01);
   gui.addColor(CONFIG, "fogColor");
};
const setConfig = () => {
   return {
      distortionStrength: CONFIG.distortionStrength,
      fogEdge0: CONFIG.fogEdge0,
      fogEdge1: CONFIG.fogEdge1,
      fogColor: CONFIG.fogColor,
   } as FogProjectionParams;
};

/**
 * Adds noise to the received texture and returns the texture. It's like projecting an image onto fog!
 */
export const UseFogProjection = (args: FogProjectionParams) => {
   const updateGUI = useGUI(setGUI);
   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);
   const fxRef = React.useRef<TFxMaterial>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateTransitionBg] = useTransitionBg({ size, dpr });
   const [updateNoise] = useNoise({ size, dpr });
   const [updateFogProjection] = useFogProjection({ size });

   useFrame((props) => {
      const bgTexture = updateTransitionBg(props, {
         imageResolution: CONSTANT.imageResolution,
         texture0: bg,
      });
      const noise = updateNoise(props);
      const fx = updateFogProjection(props, {
         texture: bgTexture,
         noiseMap: noise,
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
