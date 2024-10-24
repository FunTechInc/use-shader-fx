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
   useMorphParticles,
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
   // gui.addColor(CONFIG, "color0");
   // gui.addColor(CONFIG, "color1");
   // gui.addColor(CONFIG, "color2");
   // gui.addColor(CONFIG, "color3");
   gui.add(CONFIG, "wobbleStrength", 0, 10, 0.01);
   gui.add(CONFIG, "wobblePositionFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "wobbleTimeFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "warpStrength", 0, 10, 0.01);
   gui.add(CONFIG, "warpPositionFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "warpTimeFrequency", 0, 10, 0.01);
   gui.add(CONFIG, "displacementIntensity", 0, 10, 0.01);
   gui.add(CONFIG, "displacementColorIntensity", 0, 40, 0.01);
   gui.add(CONFIG, "sizeRandomIntensity", 0, 10, 0.01);
   gui.add(CONFIG, "sizeRandomTimeFrequency", 0, 3, 0.01);
   gui.add(CONFIG, "sizeRandomMin", 0, 1, 0.01);
   gui.add(CONFIG, "sizeRandomMax", 1, 2, 0.01);
   gui.add(CONFIG, "divergence", -2, 2, 0.1);
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
      dpr: 0.1,
   });

   const colorVec = new THREE.Vector3(0, 0, 0);
   setFluid({
      fluidColor: (velocity: THREE.Vector2) => {
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
      geometry: useMemo(() => new THREE.IcosahedronGeometry(2.5, 50), []),
      positions: morphList,
      uvs: uvList,
      // geometry: new THREE.PlaneGeometry(5, 5, 100, 100),
      // onBeforeCompile: useCallback((shader: THREE.Shader) => {
      //    // shader.vertexShader = shader.vertexShader.replace(
      //    //    "gl_Position = projectedPosition += wobble;",
      //    //    "gl_Position = projectedPosition += wobble + 2.;"
      //    // );
      //    console.log(shader);
      // }, []),
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

   useFrame((state) => {
      const b = beat(state.clock);
      updateFluid(state, {
         pointerValues: updatePointer(refPointer.current),
      });
      updatePoints(state, {
         ...setConfig(),
         displacement: fluid,
         picture: funkun,
         alphaPicture: funkunAlpha,
         // map: funkun,
         // alphaMap: funkunAlpha,
         beat: b.beat,
         morphProgress: Math.max(Math.sin(state.clock.getElapsedTime() / 2), 0),
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

/*===============================================
you can also use useMorphParticles (FBO)
===============================================*/
// export const Playground = () => {
//    const { size, viewport, scene, camera } = useThree();

//    const [updatePoints, setPoints, { output }] = useMorphParticles({
//       camera,
//       size,
//       dpr: viewport.dpr,
//       geometry: new THREE.IcosahedronGeometry(2.5, 50),
//       positions: morphList,
//       uvs: uvList,
//       // geometry: new THREE.PlaneGeometry(5, 5, 100, 100),
//    });

//    const beat = useBeat(140, "easeOutCubic");
//    const updatePointer = usePointer();
//    const refPointer = useRef(new THREE.Vector2(0, 0));
//    const handlePointerMove = (e: any) => {
//       if (!e?.pointer) {
//          return;
//       }
//       refPointer.current = e.pointer;
//    };

//    useFrame((state) => {
//       const b = beat(state.clock);
//       updatePoints(state, {
//          ...setConfig(),
//          // map: funkun,
//          // alphaMap: funkunAlpha,
//          beat: b.beat,
//          morphProgress: Math.max(Math.sin(state.clock.getElapsedTime() / 2), 0),
//          // morphProgress: 0.5,
//       });
//    });

//    return (
//       <mesh>
//          <planeGeometry args={[2, 2]} />
//          <fxMaterial key={FxMaterial.key} u_fx={output} />
//       </mesh>
//    );
// };
