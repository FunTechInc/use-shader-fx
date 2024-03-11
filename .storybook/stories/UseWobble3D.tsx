import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import {
   useWobble3D,
   useCreateWobble3D,
} from "../../packages/use-shader-fx/src";
import {
   WOBBLE3D_PARAMS,
   Wobble3DParams,
} from "../../packages/use-shader-fx/src/fxs/3D/useWobble3D";
import { Environment, OrbitControls } from "@react-three/drei";

extend({ FxMaterial });

const CONFIG: Wobble3DParams = structuredClone(WOBBLE3D_PARAMS);
const setGUI = (gui: GUI) => {
   gui.addColor(CONFIG, "color0");
   gui.addColor(CONFIG, "color1");
   gui.addColor(CONFIG, "color2");
   gui.addColor(CONFIG, "color3");
   gui.add(CONFIG, "wobbleStrength", 0, 10, 0.01);
   gui.add(CONFIG, "wobblePositionFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "wobbleTimeFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "warpStrength", 0, 10, 0.01);
   gui.add(CONFIG, "warpPositionFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "warpTimeFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "wobbleShine", 0, 5, 0.01);
   gui.add(CONFIG, "samples", 0, 10, 1);
   gui.add(CONFIG, "colorMix", 0, 1, 0.01);
   gui.add(CONFIG, "chromaticAberration", 0, 10, 0.01);
   gui.add(CONFIG, "anisotropicBlur", 0, 10, 0.01);
   gui.add(CONFIG, "distortion", 0, 10, 0.01);
   gui.add(CONFIG, "distortionScale", 0, 10, 0.01);
   gui.add(CONFIG, "temporalDistortion", 0, 10, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as Wobble3DParams;
};

export const UseWobble3D = (args: Wobble3DParams) => {
   const updateGUI = useGUI(setGUI);

   const [updateWobble, wobble] = useCreateWobble3D({
      baseMaterial: THREE.MeshPhysicalMaterial,
      materialParameters: {
         iridescence: 1,
         metalness: 0.0,
         roughness: 0.0,
         transmission: 2,
         thickness: 1,
         transparent: true,
      },
   });

   useFrame((props) => {
      updateWobble(props, {
         ...setConfig(),
      });
      updateGUI();
   });
   return (
      <mesh>
         <Environment preset="warehouse" background />
         <OrbitControls />
         <primitive object={wobble.mesh} />
      </mesh>
   );
};
