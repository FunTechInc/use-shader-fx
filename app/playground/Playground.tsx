"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
   useNoise,
   useFluid,
   useFxBlending,
   useColorStrata,
   useBrightnessPicker,
} from "@/packages/use-shader-fx/src";
import {
   NoiseParams,
   NOISE_PARAMS,
} from "@/packages/use-shader-fx/src/hooks/useNoise";
import {
   ColorStrataParams,
   COLORSTRATA_PARAMS,
} from "@/packages/use-shader-fx/src/hooks/useColorStrata";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";

const CONFIG = {
   colorStrata: {
      ...structuredClone(COLORSTRATA_PARAMS),
      laminateLayer: 10,
      laminateInterval: new THREE.Vector2(0.1, 0.1),
      laminateDetail: new THREE.Vector2(0.7, 0.7),
      distortion: new THREE.Vector2(10.0, 10.0),
      colorFactor: new THREE.Vector3(1, 1, 1),
      timeStrength: new THREE.Vector2(1, 1),
      noiseStrength: new THREE.Vector2(1, 1),
   } as ColorStrataParams,
   color: {
      color0: new THREE.Color(0xff0000),
      color1: new THREE.Color(0x0000ff),
      color2: new THREE.Color(0x00ff00),
      color3: new THREE.Color(0xffff00),
   },
};

const setGUI = (gui: GUI) => {
   //color strata
   const colorStrata = gui.addFolder("colorStrata");
   colorStrata.add(CONFIG.colorStrata, "laminateLayer", 0, 20, 1);
   colorStrata.add(CONFIG.colorStrata, "scale", 0, 1, 0.01);
   const laminateInterval = colorStrata.addFolder("laminateInterval");
   laminateInterval.add(CONFIG.colorStrata.laminateInterval!, "x", 0, 2, 0.01);
   laminateInterval.add(CONFIG.colorStrata.laminateInterval!, "y", 0, 2, 0.01);
   const laminateDetail = colorStrata.addFolder("laminateDetail");
   laminateDetail.add(CONFIG.colorStrata.laminateDetail!, "x", 0, 10, 0.1);
   laminateDetail.add(CONFIG.colorStrata.laminateDetail!, "y", 0, 10, 0.1);
   const distortion = colorStrata.addFolder("distortion");
   distortion.add(CONFIG.colorStrata.distortion!, "x", 0, 10, 0.01);
   distortion.add(CONFIG.colorStrata.distortion!, "y", 0, 10, 0.01);
   const colorFactor = colorStrata.addFolder("colorFactor");
   colorFactor.add(CONFIG.colorStrata.colorFactor!, "x", 0, 10, 0.01);
   colorFactor.add(CONFIG.colorStrata.colorFactor!, "y", 0, 10, 0.01);
   colorFactor.add(CONFIG.colorStrata.colorFactor!, "z", 0, 10, 0.01);
   const timeStrength = colorStrata.addFolder("timeStrength");
   timeStrength.add(CONFIG.colorStrata.timeStrength!, "x", 0, 2, 0.01);
   timeStrength.add(CONFIG.colorStrata.timeStrength!, "y", 0, 2, 0.01);
   const noiseStrength = colorStrata.addFolder("noiseStrength");
   noiseStrength.add(CONFIG.colorStrata.noiseStrength!, "x", 0, 5, 0.01);
   noiseStrength.add(CONFIG.colorStrata.noiseStrength!, "y", 0, 5, 0.01);
   // color
   const color = gui.addFolder("color");
   color.addColor(CONFIG.color, "color0");
   color.addColor(CONFIG.color, "color1");
   color.addColor(CONFIG.color, "color2");
   color.addColor(CONFIG.color, "color3");
};

const setConfig = () => {
   return {
      colorStrata: { ...CONFIG.colorStrata },
      color: { ...CONFIG.color },
   };
};

export const Playground = () => {
   const updateGUI = useGUI(setGUI);

   const ref = useRef<THREE.ShaderMaterial>(null);
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [updateColorStrata] = useColorStrata({ size, dpr });

   useFrame((props) => {
      const colorStrata = updateColorStrata(props, {
         ...setConfig().colorStrata,
         texture: false,
         noise: false,
      });
      ref.current!.uniforms.u_fx.value = colorStrata;
      ref.current!.uniforms.u_color0.value = setConfig().color.color0;
      ref.current!.uniforms.u_color1.value = setConfig().color.color1;
      ref.current!.uniforms.u_color2.value = setConfig().color.color2;
      ref.current!.uniforms.u_color3.value = setConfig().color.color3;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <shaderMaterial
            ref={ref}
            vertexShader={`
					varying vec2 vUv;
						void main() {
							vUv = uv;
							gl_Position = vec4(position, 1.0);
						}
						`}
            fragmentShader={`
						precision highp float;
						varying vec2 vUv;
						uniform sampler2D u_fx;
						uniform vec3 u_color0;
						uniform vec3 u_color1;
						uniform vec3 u_color2;
						uniform vec3 u_color3;
						
						void main() {
							vec2 uv = vUv;
							
							vec2 map = texture2D(u_fx, uv).rg;
							vec2 normalizedMap = map * 2.0 - 1.0;
							
							uv = uv * 2.0 - 1.0;
							uv *= mix(vec2(1.0), abs(normalizedMap), 3.0);
							uv = (uv + 1.0) / 2.0;

							vec3 col = mix(mix(u_color0, u_color1, uv.x), mix(u_color2, u_color3, uv.x), uv.y);
							
							gl_FragColor = vec4(col, 1.0);
						}
					`}
            uniforms={{
               u_fx: { value: null },
               u_color0: { value: null },
               u_color1: { value: null },
               u_color2: { value: null },
               u_color3: { value: null },
            }}
         />
      </mesh>
   );
};
