"use client";

import * as THREE from "three";
import { useCallback, useMemo, useRef, useState } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import { useBeat, useBlank } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import { Environment, OrbitControls } from "@react-three/drei";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";

extend({ FxMaterial });

const CONFIG = {
   scale: 0.1,
   box: () => {},
};

const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "scale", 0.0001, 0.2, 0.0001);
   gui.add(CONFIG, "box").name("3D⚡️");
   return gui;
};

export const Playground = () => {
   const updateGUI = useGUI(setGUI);
   const { size, viewport } = useThree();
   const [gear] = useLoader(THREE.TextureLoader, [
      "/shoasakawa/gear/gear.webp",
   ]);
   const [updateBlank, setBlank, { output: blank }] = useBlank({
      size,
      dpr: viewport.dpr,
      uniforms: useMemo(
         () => ({
            lerpPointer: { value: new THREE.Vector2(0) },
            tileSize: { value: CONFIG.scale },
            bigRadius: { value: 0.34 },
            smallRadius: { value: 0.12 },
            outerColor0: { value: new THREE.Color("#FF0038") },
            outerColor1: { value: new THREE.Color("#AD00FF") },
            outerColor2: { value: new THREE.Color(0, 0, 0) },
            innerColor0: { value: new THREE.Color("#FFD500") },
            innerColor1: { value: new THREE.Color("#FF0038") },
            innerColor2: { value: new THREE.Color("#008CFF") },
            isBox: { value: false },
         }),
         []
      ),
      onBeforeCompile: useCallback((shader: THREE.Shader) => {
         shader.fragmentShader = shader.fragmentShader.replace(
            "#usf <uniforms>",
            `
					uniform float tileSize;
					uniform float bigRadius;
					uniform float smallRadius;
					uniform vec3 outerColor0;
					uniform vec3 outerColor1;
					uniform vec3 outerColor2;
					uniform vec3 innerColor0;
					uniform vec3 innerColor1;
					uniform vec3 innerColor2;
					uniform vec2 lerpPointer;
					uniform bool isBox;

					float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

					vec4 getCircleColor (float d , float r, vec3 c0,vec3 c1, vec3 c2){
						float dist = d / r;
						float nDist = dist*2.-1.;
						return vec4(mix(mix(c0, c1, nDist),mix(c1, c2, nDist), dist),1.);
					}
				`
         );
         shader.fragmentShader = shader.fragmentShader.replace(
            "#usf <main>",
            `
					vec2 uv = vUv;
					float aspect = uResolution.x / uResolution.y;
					uv.x *= isBox ? 1. : aspect;

					float tile = tileSize;
					vec2 gridUV = fract(uv / tile);
					vec2 gridIndex = floor(uv / tile);
					float gridHash = hash(gridIndex);

					float bigDist = distance(gridUV, vec2(.5));
				
					if(bigDist>.49){
						discard;
					}

					if(bigDist < bigRadius){
						usf_FragColor = getCircleColor(bigDist, bigRadius, outerColor0, outerColor1, outerColor2);
						vec2 pointer = lerpPointer*(gridHash+.1);
						vec2 offsets[4] = vec2[4](
							vec2(0., -smallRadius*2.2)+pointer*0.2,
							vec2(smallRadius*1.6, 0.)+pointer*0.15,
							vec2(0., smallRadius*2.2)+pointer*0.1,
							vec2(smallRadius*-1.6, 0.)+pointer*0.05
						);
						for (int i = 0; i < 4; i++) {
							vec2 smallCenter = vec2(.5)+offsets[i]*.4;
							float smallDist = distance(gridUV, smallCenter);
							if (smallDist < smallRadius + sin(uTime*(gridHash+.5)+float(i))*.05) {
								usf_FragColor = getCircleColor(smallDist, smallRadius, innerColor0, innerColor1, innerColor2);
								break;
							}
						}
					}else{
						float angle = uTime*(gridHash+.1)*.2;
						float cosAngle = cos(angle);
						float sinAngle = sin(angle);
						mat2 rotationMatrix = mat2(
							cosAngle, -sinAngle,
							sinAngle, cosAngle
						);
						vec2 texCoord = gridUV-vec2(.5);
						texCoord = rotationMatrix * texCoord;
						texCoord += vec2(.5);
						usf_FragColor = texture2D(uTexture,texCoord);
					}
				`
         );
      }, []),
   });

   setBlank({
      texture: gear,
   });

   const beater = useBeat(120, "easeInOutQuad");
   const pointerVec = new THREE.Vector2();

   const [isBox, setIsBox] = useState(false);

   CONFIG.box = () => setIsBox((prev) => !prev);

   const meshRef = useRef<THREE.Mesh>(null);
   useFrame((state) => {
      const { beat } = beater(state.clock);
      updateBlank(
         state,
         {
            beat: beat,
         },
         {
            tileSize: CONFIG.scale,
            lerpPointer: pointerVec.lerp(state.pointer, 0.1),
            isBox,
         }
      );
      if (meshRef.current!) {
         meshRef.current!.rotation.x += 0.01;
         meshRef.current!.rotation.y += 0.01;
         meshRef.current!.rotation.z += 0.01;
      }
      updateGUI();
   });

   return (
      <>
         {isBox ? (
            <mesh ref={meshRef}>
               <ambientLight />
               <directionalLight position={[10, 10, 10]} />
               <Environment preset="warehouse" />
               <boxGeometry args={[3, 3, 3]} />
               <meshStandardMaterial
                  map={blank}
                  roughness={0.05}
                  metalness={0.4}
               />
               <OrbitControls />
            </mesh>
         ) : (
            <mesh>
               <planeGeometry args={[2, 2]} />
               <fxMaterial u_fx={blank} key={FxMaterial.key} />
            </mesh>
         )}
      </>
   );
};
