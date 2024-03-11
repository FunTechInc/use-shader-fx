import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useCreateMorphParticles } from "../../packages/use-shader-fx/src";
import {
   MORPHPARTICLES_PARAMS,
   MorphParticlesParams,
} from "../../packages/use-shader-fx/src/fxs/3D/useMorphParticles";
import { Environment, OrbitControls } from "@react-three/drei";

extend({ FxMaterial });

const CONFIG: MorphParticlesParams = structuredClone(MORPHPARTICLES_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "blurAlpha", 0, 1, 0.01);
   gui.add(CONFIG, "blurRadius", 0, 2, 0.01);
   gui.add(CONFIG, "pointSize", 0.01, 2, 0.01);
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
   gui.add(CONFIG, "displacementIntensity", 0, 10, 0.01);
   gui.add(CONFIG, "displacementColorIntensity", 0, 40, 0.01);
   gui.add(CONFIG, "morphProgress", 0, 1, 0.01);
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as MorphParticlesParams;
};

const morphList = [
   new THREE.PlaneGeometry(5, 5, 100, 100).attributes.position
      .array as Float32Array,
   new THREE.TorusGeometry(2.5, 1, 50, 30).attributes.position
      .array as Float32Array,
];
const uvList = [
   new THREE.PlaneGeometry(5, 5, 100, 100).attributes.uv.array as Float32Array,
   new THREE.TorusGeometry(2.5, 1, 50, 30).attributes.uv.array as Float32Array,
];

export const UseMorphParticles = (args: MorphParticlesParams) => {
   const updateGUI = useGUI(setGUI);

   const { viewport, size } = useThree();

   const [updateMorph, morph] = useCreateMorphParticles({
      scene: false,
      size,
      dpr: viewport.dpr,
      geometry: React.useMemo(() => new THREE.IcosahedronGeometry(2.5, 50), []),
      positions: morphList,
      uvs: uvList,
   });

   useFrame((props) => {
      updateMorph(props, {
         ...setConfig(),
      });
      updateGUI();
   });
   return (
      <mesh>
         <OrbitControls />
         <primitive object={morph.points} />
      </mesh>
   );
};
