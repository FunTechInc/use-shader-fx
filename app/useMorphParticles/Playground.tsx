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
   useFluid,
   usePointer,
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
   gui.add(CONFIG, "displacementIntensity", 0, 10, 0.01);
   gui.add(CONFIG, "displacementColorIntensity", 0, 40, 0.01);
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

export const Playground = () => {
   const updateGUI = useGUI(setGUI);
   const [funkun, funkunAlpha] = useLoader(THREE.TextureLoader, [
      "/funkun.jpg",
      "/funkun-alpha.jpg",
   ]);
   const { size, viewport, scene } = useThree();

   const [updateFluid, setFluid, { output: fluid }] = useFluid({
      size,
      dpr: viewport.dpr,
   });

   const colorVec = new THREE.Vector3(0, 0, 0);
   setFluid({
      fluid_color: (velocity: THREE.Vector2) => {
         const rCol = Math.max(0.0, Math.abs(velocity.x) * 200);
         const gCol = Math.max(0.0, Math.abs(velocity.y) * 100);
         const bCol = Math.max(0.0, (rCol + gCol) / 2);
         return colorVec.set(rCol, gCol, bCol);
      },
   });

   const [updatePoints, points] = useCreateMorphParticles({
      scene: false,
      size,
      dpr: viewport.dpr,
      geometry: new THREE.IcosahedronGeometry(2.5, 50),
      positions: morphList,
      uvs: uvList,
      // geometry: new THREE.PlaneGeometry(5, 5, 100, 100),
   });

   const beat = useBeat(140, "easeOutCubic");
   const updatePointer = usePointer();
   const refPointer = useRef(new THREE.Vector2(0, 0));
   const handlePointerMove = (e: any) => {
      if (!e?.pointer) {
         return;
      }
      refPointer.current = e.pointer;
   };

   useFrame((props) => {
      const b = beat(props.clock);
      updateFluid(props, {
         pointerValues: updatePointer(refPointer.current),
      });
      // updateFluid(props);
      updatePoints(props, {
         ...setConfig(),
         displacement: fluid,
         picture: funkun,
         alphaPicture: funkunAlpha,
         // map: funkun,
         // alphaMap: funkunAlpha,
         beat: b.beat,
         // morphProgress: Math.max(Math.sin(props.clock.getElapsedTime() / 2), 0),
         // morphProgress: 0.5,
      });
      updateGUI();
   });

   return (
      <mesh>
         <OrbitControls />
         <primitive object={points.points} />
         <primitive
            onPointerMove={handlePointerMove}
            object={points.interactiveMesh}
         />
      </mesh>
   );
};
