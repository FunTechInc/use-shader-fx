"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
   useFluid,
   useFxBlending,
   useColorStrata,
} from "@/packages/use-shader-fx/src";
import {
   FluidParams,
   FLUID_PARAMS,
} from "@/packages/use-shader-fx/src/hooks/useFluid";
import {
   ColorStrataParams,
   COLORSTRATA_PARAMS,
} from "@/packages/use-shader-fx/src/hooks/useColorStrata";
import {
   FxBlendingParams,
   FXBLENDING_PARAMS,
} from "@/packages/use-shader-fx/src/hooks/useFxBlending";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";

const CONFIG = {
   fluid: structuredClone(FLUID_PARAMS) as FluidParams,
   colorStrata: {
      ...structuredClone(COLORSTRATA_PARAMS),
      laminateLayer: 20,
      laminateInterval: new THREE.Vector2(0.1, 0.1),
      laminateDetail: new THREE.Vector2(0.7, 0.7),
      distortion: new THREE.Vector2(10.0, 10.0),
      colorFactor: new THREE.Vector3(1, 1, 1),
      timeStrength: new THREE.Vector2(1, 1),
      noiseStrength: new THREE.Vector2(1, 1),
   } as ColorStrataParams,
   fxBlending: structuredClone(FXBLENDING_PARAMS) as FxBlendingParams,
};

const setGUI = (gui: GUI) => {
   //fluid
   const fluid = gui.addFolder("fluid");
   fluid.add(CONFIG.fluid, "density_dissipation", 0, 1, 0.01);
   fluid.add(CONFIG.fluid, "velocity_dissipation", 0, 1, 0.01);
   fluid.add(CONFIG.fluid, "velocity_acceleration", 0, 100, 1);
   fluid.add(CONFIG.fluid, "pressure_dissipation", 0, 1, 0.01);
   fluid.add(CONFIG.fluid, "pressure_iterations", 0, 30, 1);
   fluid.add(CONFIG.fluid, "curl_strength", 0, 100, 1);
   fluid.add(CONFIG.fluid, "splat_radius", 0, 0.2, 0.001);
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
   // fx blending
   const fxBlending = gui.addFolder("fxBlending");
   fxBlending.add(CONFIG.fxBlending, "mapIntensity", 0, 10, 0.01);
};

const setConfig = () => {
   return {
      fluid: { ...CONFIG.fluid },
      colorStrata: { ...CONFIG.colorStrata },
      fxBlending: { ...CONFIG.fxBlending },
   };
};

export const Playground = () => {
   const updateGUI = useGUI(setGUI);

   const ref = useRef<THREE.ShaderMaterial>(null);
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateFluid] = useFluid({ size, dpr });
   const [updateFxBlending] = useFxBlending({ size, dpr });
   const [updateColorStrata] = useColorStrata({ size, dpr });

   useFrame((props) => {
      const fluid = updateFluid(props, {
         ...setConfig().fluid,
      });
      const colorStrata = updateColorStrata(props, {
         ...setConfig().colorStrata,
      });
      const blending = updateFxBlending(props, {
         ...setConfig().fxBlending,
         texture: colorStrata,
         map: fluid,
      });
      ref.current!.uniforms.u_fx.value = blending;
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
						
						void main() {
							vec2 uv = vUv;
							gl_FragColor = texture2D(u_fx, uv);
						}
					`}
            uniforms={{
               u_fx: { value: null },
            }}
         />
      </mesh>
   );
};
