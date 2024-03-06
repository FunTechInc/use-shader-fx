"use client";

import * as THREE from "three";
import { use, useCallback, useEffect, useMemo, useRef } from "react";
import {
   useFrame,
   useThree,
   extend,
   useLoader,
   Size,
} from "@react-three/fiber";
import {
   useCreateMorphParticles,
   MORPHPARTICLES_PARAMS,
   MorphParticlesParams,
   useBeat,
} from "@/packages/use-shader-fx/src";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { OrbitControls } from "@react-three/drei";

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
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as MorphParticlesParams;
};

/*===============================================
TODO 
- useMorphParticles
	v morphする
		- tjの40
	v picture
		v 全体にマップするtexture
	v particleにマップするtexture
		- 
	- wobble
		- 4Dノイズかける（時間が入るから）
		- wobble3Dの仕組みを利用する
	v color
		v 4色双線形補間
	v particleのサイズ
	v 球体にするレベル
===============================================*/

export const Playground = () => {
   const updateGUI = useGUI(setGUI);
   const ref = useRef<FxMaterialProps>();
   const [funkun, funkunAlpha] = useLoader(THREE.TextureLoader, [
      "/funkun.jpg",
      "/funkun-alpha.jpg",
   ]);
   const { size, viewport, gl } = useThree();

   const morphList = [
      new THREE.PlaneGeometry(5, 5, 100, 100).attributes.position
         .array as Float32Array,
      new THREE.TorusGeometry(2.5, 1, 50, 30).attributes.position
         .array as Float32Array,
   ];

   const [updatePoints, points] = useCreateMorphParticles({
      scene: false,
      size,
      dpr: viewport.dpr,
      geometry: new THREE.IcosahedronGeometry(2.5, 50),
      // positions: morphList,
      // geometry: new THREE.PlaneGeometry(5, 5, 100, 100),
   });
   const beat = useBeat(140, "easeOutCubic");
   useFrame((props) => {
      const b = beat(props.clock);
      updatePoints(props, {
         ...setConfig(),
         // picture: funkun,
         // alphaPicture: funkunAlpha,
         map: funkun,
         alphaMap: funkunAlpha,
         beat: b.beat,
         morphProgress: Math.max(Math.sin(props.clock.getElapsedTime() / 2), 0),
      });
      updateGUI();
   });

   return (
      <mesh>
         <OrbitControls />
         <primitive object={points.points} />
      </mesh>
   );
};
