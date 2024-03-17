"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import {
   useCreateMorphParticles,
   MorphParticlesParams,
   useBeat,
} from "@/packages/use-shader-fx/src";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { OrbitControls } from "@react-three/drei";
import { CustomSineCurve } from "./CustomSineCurve";
import { CanvasConfig } from "./CanvasConfig";

const setGUI = (gui: GUI) => {
   gui.add(CanvasConfig.getInstance(), "openingAnimate");
   gui.add(CanvasConfig.getInstance(), "scrollY");
   gui.add(CanvasConfig.getInstance(), "gather");
   gui.add(CanvasConfig.getInstance(), "diverge");
   gui.add(CanvasConfig.getInstance(), "frameOut");
   gui.add(CanvasConfig.getInstance(), "frameIn");
   gui.add(CanvasConfig.getInstance(), "positionBottom");
};

const DEFAULT_GEOMETRY = new THREE.PlaneGeometry(10, 10, 40, 40);
const MORPH_LSIT = [
   new THREE.IcosahedronGeometry(3, 1).attributes.position
      .array as Float32Array,
];
const UV_LIST = [
   new THREE.IcosahedronGeometry(3, 1).attributes.uv.array as Float32Array,
];

export const Playground = () => {
   const config = CanvasConfig.getInstance();
   const { size, viewport, gl } = useThree();

   useEffect(() => {
      document.documentElement.style.backgroundColor = "#FAF6F0";
   }, []);

   const updateGUI = useGUI(setGUI);

   const [alphaMap] = useLoader(
      THREE.TextureLoader,
      config.texturesPath.alphaMap
   );
   const bgPointsTextures = useLoader(
      THREE.TextureLoader,
      config.texturesPath.bgPoints
   );
   const pointsTextures = useLoader(
      THREE.TextureLoader,
      config.texturesPath.points
   );

   const capablePointsTextures = useMemo(() => {
      // bgの3枚ととalphamap(alphamapはbgと表面で2枚使ってる)を引いた数が、1ドローコール最大数
      const minusLength =
         config.texturesPath.alphaMap.length * 2 +
         config.texturesPath.bgPoints.length;
      const maxLength = gl.capabilities.maxTextures - minusLength;
      const textures = [];
      for (let i = 0; i < maxLength; i++) {
         if (pointsTextures[i]) {
            textures.push(pointsTextures[i]);
         }
      }
      return textures;
   }, [
      pointsTextures,
      gl.capabilities.maxTextures,
      config.texturesPath.bgPoints,
      config.texturesPath.alphaMap,
   ]);

   const particlesInitProps = {
      size,
      dpr: viewport.dpr,
      geometry: DEFAULT_GEOMETRY,
      positions: MORPH_LSIT,
      uvs: UV_LIST,
   };
   const [updatePoints, points] = useCreateMorphParticles({
      ...particlesInitProps,
      mapArray: capablePointsTextures,
   });
   const [updatePointsBg, pointsBg] = useCreateMorphParticles({
      ...particlesInitProps,
      mapArray: bgPointsTextures,
   });

   useEffect(() => {
      [points.points.material, pointsBg.points.material].forEach((mat) => {
         const material = mat as THREE.ShaderMaterial;
         material.blending = THREE.NormalBlending;
         material.depthTest = true;
      });
      // bgの背景オフセット
      pointsBg.points.position.set(
         config.bgPointsOffset.x,
         config.bgPointsOffset.y,
         config.bgPointsOffset.z
      );
      updatePoints(null, {
         ...config.pointsConstantParams,
         alphaPicture: alphaMap,
      });
      updatePointsBg(null, {
         ...config.bgPointsConstantParams,
         alphaPicture: alphaMap,
      });
   }, [points, updatePoints, alphaMap, pointsBg, updatePointsBg, config]);

   const updateBeat = useBeat(80, "easeInOutSine");
   const pointerVec = useRef(new THREE.Vector2(0, 0));
   const divergencePointVec = useRef(new THREE.Vector3(0, 0, 0));
   const cameraVec = useRef(new THREE.Vector3(0, 0, 0));
   const divergenceVec = useRef(new THREE.Vector2(0, 0));

   const lerpV = 0.05;

   useFrame((props) => {
      const { pointer, clock, camera } = props;
      const currentPointer = pointerVec.current.lerp(pointer, lerpV);
      const beat = updateBeat(clock);
      const divergenceStrength = divergenceVec.current
         .set(currentPointer.x, currentPointer.y)
         .length();
      const divergencePoint = divergencePointVec.current.set(
         currentPointer.x * 2,
         currentPointer.y * 2,
         Math.abs(currentPointer.length())
      );

      /*===============================================
		points　更新
		===============================================*/
      const morphP = config.fxParmas.morphProgress;
      const updatePointsProps: MorphParticlesParams = {
         divergence: divergenceStrength + config.fxParmas.divergence,
         divergencePoint: divergencePoint,
         beat: beat.beat,
         morphProgress: morphP,
      };
      updatePoints(props, updatePointsProps);
      updatePointsBg(props, updatePointsProps);

      /*===============================================
		スクロールでy軸移動
		===============================================*/
      const posY = config.fxParmas.yOffset;
      points.points.position.y = posY;
      pointsBg.points.position.y = posY + config.bgPointsOffset.y;

      /*===============================================
		camera
		===============================================*/
      camera.position.lerp(
         cameraVec.current.set(
            currentPointer.y * 0.3,
            currentPointer.x * 0.3,
            5 + config.fxParmas.cameraZ
         ),
         lerpV
      );
      camera.lookAt(0, 0, config.fxParmas.cameraZ);

      updateGUI();
   });

   return (
      <mesh>
         {/* <OrbitControls /> */}
         <primitive object={points.points} />
         <primitive object={pointsBg.points} />
         {/* <CustomSineCurve start={new THREE.Vector3(1, 1, 0)} color={0x00aee0} />
         <CustomSineCurve
            start={new THREE.Vector3(-4, -2, 0)}
            color={0xe60000}
         /> */}
      </mesh>
   );
};
