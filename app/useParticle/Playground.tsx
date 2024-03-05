"use client";

import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
   useFrame,
   useThree,
   extend,
   useLoader,
   Size,
} from "@react-three/fiber";
import {
   useFluid,
   useNoise,
   useColorStrata,
   useMarble,
   useHSV,
   ColorStrataParams,
   HSVParams,
   MarbleParams,
   useParticles,
   useBrush,
   usePointer,
   PointerValues,
   useMorphVertices,
} from "@/packages/use-shader-fx/src";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { CONFIG as HomeConfig } from "../_home/Playground";
import { OrbitControls } from "@react-three/drei";

extend({ FxMaterial });

// const CONFIG = {
// };
// const setGUI = (gui: GUI) => {
// };
// const setConfig = () => {
// };

const initParticleBufferGeo = (texSize: Size): THREE.BufferGeometry => {
   // Fibonacci球面配置
   const points = 120; // 配置するパーティクルの数
   const size = 0.3; // pc
   // const size = 200; // sp
   const goldenRatio = (1 + Math.sqrt(5)) / 2;
   const angleIncrement = Math.PI * 2 * goldenRatio;

   // BufferGeometryとFloat32Arrayを使用して頂点データを保持
   const positions = new Float32Array(points * 3); // 各頂点にはx, y, zの3つの値があるため

   for (let i = 0; i < points; i++) {
      const t = i / points;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      const x = Math.sin(inclination) * Math.cos(azimuth);
      const y =
         Math.sin(inclination) *
         Math.sin(azimuth) *
         (texSize.width / texSize.height);
      const z = Math.cos(inclination);

      // positions配列に頂点の位置データをセット
      positions[i * 3] = x * size;
      positions[i * 3 + 1] = y * size;
      positions[i * 3 + 2] = z * size;
   }

   const geometry = new THREE.BufferGeometry();
   geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

   return geometry;
};

const morphPattern1Buffer = (texSize: Size): Float32Array => {
   const count = 120;
   const arr = [];
   for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
         arr.push(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
         );
      }
   }
   const positions = new Float32Array(arr);
   return positions;
};

const morphPattern2Buffer = (texSize: Size): Float32Array => {
   const count = 100;
   const arr = [];

   // 円筒状にランダムに配置
   for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
         const r = 0.5;
         const theta = Math.random() * Math.PI * 2;
         const phi = Math.random() * Math.PI * 2;
         const x = r * Math.cos(theta);
         const y = r * Math.sin(theta);
         const z = r * Math.sin(phi);
         arr.push(x, y, z);
      }
   }

   const positions = new Float32Array(arr);
   return positions;
};

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();
   const [bg] = useLoader(THREE.TextureLoader, ["/momo.jpg"]);
   const { size, viewport } = useThree();
   const [updateBrush, setBrush, { output: brush }] = useFluid({
      size,
      dpr: viewport.dpr,
   });

   /*===============================================
	TODO 
	===============================================*/
   const morphList = [morphPattern1Buffer(size), morphPattern2Buffer(size)];

   const [updateParticles, setParticlesParams, particles] = useParticles({
      size,
      dpr: viewport.dpr,
      baseGeometry: initParticleBufferGeo(size),
      // baseGeometry: new THREE.BufferGeometry(),
      positions: morphList,
   });

   particles.points.frustumCulled = false;

   setParticlesParams({
      // picture: bg,
   });
   particles.camera.position.set(0, 0, 3);

   // const updatePointer = usePointer();
   // const raycaster = useMemo(() => new THREE.Raycaster(), []);
   // const rayCursor = useRef<THREE.Vector2 | null>(null);

   useFrame((props) => {
      updateParticles(props, {
         morphProgress: (props.pointer.x + 1.0) / 2.0,
         // morphProgress: 0.9,
      });

      // raycaster.setFromCamera(props.pointer, particles.camera);
      // const intersects = raycaster.intersectObject(particles.interactiveMesh);
      // if (intersects.length > 0) {
      //    const uv = intersects[0]?.uv as THREE.Vector2;
      //    if (!uv) return;
      //    rayCursor.current = uv.multiplyScalar(2).subScalar(1);
      // }

      // if (rayCursor.current) {
      //    updateBrush(props, {
      //       pointerValues: updatePointer(rayCursor.current),
      //    });
      // }
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} u_fx={particles.output} ref={ref} />
         <OrbitControls camera={particles.camera} />
         {/* <primitive object={particles.points} position={[2, 0, 0]} /> */}
      </mesh>
   );
};
