import { useRef } from "react";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { usePerformanceMonitor } from "@react-three/drei";
import { CONFIG, setGUI } from "./config";
import { useGUI } from "@/utils/useGUI";
import { FxMaterial, FxMaterialProps } from "@/utils/fxMaterial";
import {
   useFluid,
   useBlending,
   useNoise,
   useBrightnessPicker,
} from "@/packages/use-shader-fx/src";

extend({ FxMaterial });

export const Home = () => {
   const updateGUI = useGUI(setGUI);
   const mainShaderRef = useRef<FxMaterialProps>();

   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [updateNoise] = useNoise({ size, dpr });

   const [updateFluid, setFluid] = useFluid({
      size,
      dpr,
   });

   const [updateBlending] = useBlending({ size, dpr });

   const [updateBrightnessPicker] = useBrightnessPicker({ size, dpr });

   usePerformanceMonitor({
      onChange({ factor }) {
         setFluid({
            pressure_iterations: Math.max(2, Math.floor(20 * factor)),
         });
      },
   });

   useFrame((props) => {
      const noise = updateNoise(props, {
         scale: 0.002,
         timeStrength: 0.2,
         warpStrength: 2.0,
      });

      const fx = updateFluid(props, {
         density_dissipation: CONFIG.fluid.density_dissipation,
         velocity_dissipation: CONFIG.fluid.velocity_dissipation,
         velocity_acceleration: CONFIG.fluid.velocity_acceleration,
         pressure_dissipation: CONFIG.fluid.pressure_dissipation,
         curl_strength: CONFIG.fluid.curl_strength,
         splat_radius: CONFIG.fluid.splat_radius,
         fluid_color: CONFIG.fluid.fluid_color,
      });

      const postFx = updateBlending(props, {
         distortionStrength: CONFIG.fogProjection.distortionStrength,
         edge0: CONFIG.fogProjection.fogEdge0,
         edge1: CONFIG.fogProjection.fogEdge1,
         color: CONFIG.fogProjection.fogColor,
         texture: fx,
         map: noise,
      });

      const final = updateBrightnessPicker(props, {
         texture: postFx,
      });

      const main = mainShaderRef.current;
      if (main) {
         main.u_fx = final;
         main.u_alpha = 0.0;
      }
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial ref={mainShaderRef} />
      </mesh>
   );
};

/*===============================================
playground
===============================================*/

// import * as THREE from "three";
// import { useRef } from "react";
// import { useFrame, useThree } from "@react-three/fiber";
// import { useNoise } from "@/packages/use-shader-fx/src";

// export const Home = () => {
//    const ref = useRef<THREE.ShaderMaterial>(null);
//    const size = useThree((state) => state.size);
//    const dpr = useThree((state) => state.viewport.dpr);
//    const [updateNoise] = useNoise({ size, dpr });

//    useFrame((props) => {
//       ref.current!.uniforms.u_fx.value = updateNoise(props, {
//          scale: 0.002,
//          warpOctaves: 2,
//          timeStrength: 0.2,
//          warpStrength: 20.0,
//       });
//    });

//    return (
//       <mesh>
//          <planeGeometry args={[2, 2]} />
//          <shaderMaterial
//             ref={ref}
//             vertexShader={`
// 					varying vec2 vUv;
// 						void main() {
// 							vUv = uv;
// 							gl_Position = vec4(position, 1.0);
// 						}
// 						`}
//             fragmentShader={`
// 						precision highp float;
// 						varying vec2 vUv;
// 						uniform sampler2D u_fx;
// 						float sq(float x) {
// 							return x*x*7.0;
// 						}
// 						void main() {
// 							vec2 uv = vUv;
// 							vec3 noise = texture2D(u_fx, uv).rgb;
// 							vec3 col;
// 							vec2 p = noise.rg * .4;
// 							for(float j = 0.0; j < 3.0; j++){
// 								for(float i = 1.0; i < 8.0; i++){
// 										p.x += 0.01 / (i + j) * cos(i * 10.0 * p.y + sin(i + j));
// 										p.y += 0.01 / (i + j)* cos(i * 10.0 * p.x + sin(i + j));
// 								}
// 								col[int(j)] = sin(.5 * 7.0*sq(p.x)) + sin(7.0*sq(p.y));
// 							}
// 							gl_FragColor = vec4(col, 1.0);
// 						}
// 					`}
//             uniforms={{
//                u_fx: { value: null },
//             }}
//          />
//       </mesh>
//    );
// };
