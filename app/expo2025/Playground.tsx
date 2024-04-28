"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import {
   useBeat,
   useCreateWobble3D,
   Wobble3DParams,
   WOBBLE3D_PARAMS,
   useWobble3D,
} from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { OrbitControls, Environment } from "@react-three/drei";

extend({ FxMaterial });

const CONFIG: Wobble3DParams = {
   ...structuredClone(WOBBLE3D_PARAMS),
   color0: new THREE.Color(0x920c0c),
   color1: new THREE.Color(0xb81200),
   color2: new THREE.Color(0xb20101),
   color3: new THREE.Color(0xa62b2b),
   wobbleStrength: 0.2,
   wobbleTimeFrequency: 0.4,
   warpStrength: 0.0,
   colorMix: 0,
   edgeThreshold: 0.24,
   edgeColor: new THREE.Color(0x803d3b),
};

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
   gui.add(CONFIG, "colorMix", 0, 1, 0.01);
   return gui;
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as Wobble3DParams;
};

export const Playground = () => {
   useEffect(() => {
      document.documentElement.style.backgroundColor = "#FFFDD7";
   }, []);

   const updateGUI = useGUI(setGUI);
   // const [funkun] = useLoader(THREE.TextureLoader, ["/funkun.jpg"]);

   const [updateWobble, wobble] = useCreateWobble3D({
      // geometry: useMemo(() => new THREE.TorusGeometry(1, 0.4, 16, 100), []),
      baseMaterial: THREE.MeshToonMaterial,
      materialParameters: {
         color: new THREE.Color(0xe72929),
      },
      uniforms: {
         uEyeMoving: { value: new THREE.Vector2(0, 0) },
      },
      onBeforeCompile: (shader) => {
         shader.fragmentShader = shader.fragmentShader.replace(
            "uniform float uSamples;",
            `
					uniform float uSamples;
					uniform vec2 uEyeMoving;
				`
         );
         shader.fragmentShader = shader.fragmentShader.replace(
            "#include <alphamap_fragment>",
            `
					float whiteDist = distance(uEyeMoving,vPosition);
					float blackDist = whiteDist;
					if (whiteDist < .8) {
						diffuseColor = vec4(vec3(1.), 1.0);
					}
					if (blackDist < .3) {
						diffuseColor = vec4(vec3(0.,0.,1.), 1.0);
					}
					#include <alphamap_fragment>
				`
         );

         console.log(shader.fragmentShader);
      },
   });

   useFrame((props) => {
      updateWobble(
         props,
         {
            ...setConfig(),
         },
         {
            uEyeMoving: props.pointer,
         }
      );
      updateGUI();
   });

   return (
      <mesh>
         <directionalLight
            color={"white"}
            position={[0.25, 2, 3]}
            intensity={3}
            castShadow
         />
         <OrbitControls />
         <Environment preset="warehouse" />
         <primitive object={wobble.mesh} />
      </mesh>
   );
};
