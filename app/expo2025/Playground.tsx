"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame, useThree, extend, MeshProps } from "@react-three/fiber";
import {
   useCreateWobble3D,
   Wobble3DParams,
   WOBBLE3D_PARAMS,
} from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { Environment, Lightformer } from "@react-three/drei";

extend({ FxMaterial });

const CONFIG: Wobble3DParams = {
   ...structuredClone(WOBBLE3D_PARAMS),
   wobbleStrength: 0.16,
   wobbleTimeFrequency: 0.2,
   warpStrength: 0.0,
   colorMix: 0,
};

const setGUI = (gui: GUI) => {
   gui.addColor(CONFIG, "color0");
   gui.addColor(CONFIG, "color1");
   gui.addColor(CONFIG, "color2");
   gui.addColor(CONFIG, "color3");
   gui.add(CONFIG, "wobbleStrength", 0, 2, 0.01);
   gui.add(CONFIG, "colorMix", 0, 1, 0.01);
   return gui;
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as Wobble3DParams;
};

const MyakuMyaku = (props: MeshProps) => {
   const [updateWobble, wobble] = useCreateWobble3D({
      baseMaterial: THREE.MeshStandardMaterial,
      materialParameters: useMemo(
         () => ({
            color: new THREE.Color(0xd53220),
            metalness: 0.16,
            roughness: 0.16,
         }),
         []
      ),
      uniforms: useMemo(
         () => ({
            uEyeColor: { value: new THREE.Color(0x2469b3) },
            uEyeMoving: { value: new THREE.Vector2(0, 0) },
         }),
         []
      ),
      onBeforeCompile: (shader) => {
         shader.fragmentShader = shader.fragmentShader.replace(
            "uniform float uRefractionSamples;",
            `
					uniform float uRefractionSamples;
					uniform vec2 uEyeMoving;
					uniform vec3 uEyeColor;
				`
         );
         shader.fragmentShader = shader.fragmentShader.replace(
            "#include <alphamap_fragment>",
            `
					float whiteDist = distance(uEyeMoving * 0.4,vPosition);
					float blackDist = distance(uEyeMoving * 0.8,vPosition);
					if (whiteDist < .8) {
						diffuseColor = vec4(vec3(1.), 1.0);
					}
					if (blackDist < .34) {
						diffuseColor = vec4(uEyeColor, 1.0);
					}
					#include <alphamap_fragment>
				`
         );
      },
   });
   const pointerVector = useRef(new THREE.Vector2(0, 0));
   const randomness = useMemo(() => Math.random() + 1, []);
   useFrame((props) => {
      updateWobble(
         props,
         {
            ...setConfig(),
            wobbleStrength: CONFIG.wobbleStrength! * randomness,
            wobbleTimeFrequency: CONFIG.wobbleTimeFrequency! * randomness,
         },
         {
            uEyeMoving: pointerVector.current.lerp(props.pointer, 0.24),
         }
      );
   });
   return (
      <mesh {...props}>
         <primitive object={wobble.mesh} />
      </mesh>
   );
};

export const Playground = () => {
   const updateGUI = useGUI(setGUI);

   const { camera } = useThree();

   const cameraVec = useRef(new THREE.Vector3(0, 0, 0));
   useFrame((props) => {
      camera.position.lerp(
         cameraVec.current.set(props.pointer.y * 3, props.pointer.x * 3, 12),
         0.1
      );
      camera.lookAt(0, 0, 0);

      updateGUI();
   });

   return (
      <mesh>
         {/* <Environment preset="warehouse" /> */}
         <ambientLight intensity={0.4} />
         <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
         />
         <Environment resolution={256}>
            <group rotation={[-Math.PI / 3, 0, 1]}>
               <Lightformer
                  form="circle"
                  intensity={3}
                  rotation-x={Math.PI / 2}
                  position={[0, 5, -9]}
                  scale={2}
               />
               <Lightformer
                  form="circle"
                  intensity={1}
                  rotation-y={Math.PI / 2}
                  position={[-5, 1, -1]}
                  scale={2}
               />
               <Lightformer
                  form="circle"
                  intensity={1}
                  rotation-y={Math.PI / 2}
                  position={[-5, -1, -1]}
                  scale={2}
               />
               <Lightformer
                  form="circle"
                  intensity={1}
                  rotation-y={-Math.PI / 2}
                  position={[10, 1, 0]}
                  scale={4}
               />
            </group>
         </Environment>
         <MyakuMyaku position={[-6, 0, 0]} scale={[1, 1, 1]} />
         <MyakuMyaku
            position={[-4, 3.5, 0]}
            rotation={[0, 0, -1]}
            scale={[1, 1.2, 1]}
         />
         <MyakuMyaku position={[6, 0, 0]} scale={[1.5, 1.5, 1.5]} />
         <MyakuMyaku position={[4, 4, 0]} scale={[1, 1, 1]} />
         <MyakuMyaku position={[-4, -4, 0]} scale={[1.3, 1.6, 1.6]} />
         <MyakuMyaku position={[0, 5, 0]} scale={[1.2, 1.4, 1.2]} />
         <MyakuMyaku position={[0, -5, 0]} scale={[1, 0.8, 1.8]} />
         <MyakuMyaku
            position={[4, -4, 0]}
            rotation={[0, 0, 1]}
            scale={[1.2, 1.4, 1.2]}
         />
      </mesh>
   );
};
