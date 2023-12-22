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

export const Home = () => {
   const ref = useRef<THREE.ShaderMaterial>(null);
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateNoise, setNoise] = useNoise({ size, dpr });
   const [updateFluid, setFluid] = useFluid({ size, dpr });
   const [updateFxBlending, setFxBlending] = useFxBlending({ size, dpr });
   const [updateColorStrata, setColorStrata] = useColorStrata({ size, dpr });
   const [updateBrightnessPicker] = useBrightnessPicker({ size, dpr });

   setFxBlending({
      mapIntensity: 0.45,
   });

   setNoise({
      scale: 1.0,
      warpOctaves: 1,
      noiseOctaves: 1,
      fbmOctaves: 1,
      timeStrength: 1.2,
      warpStrength: 20.0,
   });

   setFluid({
      density_dissipation: 0.96,
      velocity_dissipation: 0.99,
      curl_strength: 0.0,
      splat_radius: 0.0045,
      pressure_iterations: 1,
   });

   setColorStrata({
      laminateLayer: 2,
      laminateInterval: new THREE.Vector2(2.0, 2.0),
      laminateDetail: new THREE.Vector2(1.4, 1.2),
      distortion: new THREE.Vector2(1.4, 1.2),
      colorFactor: new THREE.Vector3(1.2, 1.0, 3.2),
   });

   useFrame((props) => {
      const noise = updateNoise(props);
      const fluid = updateFluid(props);
      const blending = updateFxBlending(props, {
         texture: fluid,
         map: noise,
      });
      const picked = updateBrightnessPicker(props, {
         texture: blending,
      });
      const colorStrata = updateColorStrata(props, {
         texture: picked,
      });
      ref.current!.uniforms.u_fx.value = colorStrata;
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

/*===============================================
playground
===============================================*/

// import * as THREE from "three";
// import { useRef } from "react";
// import { useFrame, useThree } from "@react-three/fiber";
// import {
//    useNoise,
//    useFluid,
//    useBlending,
//    useColorStrata,
//    useBrightnessPicker,
// } from "@/packages/use-shader-fx/src";

// export const Home = () => {
//    const ref = useRef<THREE.ShaderMaterial>(null);
//    const { size, dpr } = useThree((state) => {
//       return { size: state.size, dpr: state.viewport.dpr };
//    });
//    const [updateNoise, setNoise] = useNoise({ size, dpr });
//    const [updateFluid, setFluid] = useFluid({ size, dpr });
//    const [updateBlending, setBlending] = useBlending({ size, dpr });
//    const [updateColorStrata, setColorStrata] = useColorStrata({ size, dpr });
//    const [updateBrightnessPicker] = useBrightnessPicker({ size, dpr });

//    setBlending({
//       color: new THREE.Color(0xff0000),
//       brightness: new THREE.Vector3(0.2, 0.2, 0.2),
//       mapIntensity: 0.4,
//    });

//    setNoise({
//       scale: 1.0,
//       warpOctaves: 1,
//       noiseOctaves: 1,
//       fbmOctaves: 1,
//       timeStrength: 1.2,
//       warpStrength: 20.0,
//    });

//    setFluid({
//       curl_strength: 0.0,
//       splat_radius: 0.002,
//       pressure_iterations: 2,
//    });

//    setColorStrata({
//       laminateLayer: 2,
//       laminateInterval: new THREE.Vector2(2.0, 2.0),
//       laminateDetail: new THREE.Vector2(1.4, 1.2),
//       distortion: new THREE.Vector2(1.4, 1.2),
//       colorFactor: new THREE.Vector3(1.2, 1.0, 3.2),
//    });

//    useFrame((props) => {
//       const noise = updateNoise(props);
//       const fluid = updateFluid(props);
//       const picked = updateBrightnessPicker(props, {
//          texture: fluid,
//       });
//       const blending = updateBlending(props, {
//          texture: picked,
//          map: noise,
//       });
//       const colorStrata = updateColorStrata(props, {
//          texture: blending,
//       });
//       ref.current!.uniforms.u_fx.value = colorStrata;
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

// 						void main() {
// 							vec2 uv = vUv;
// 							gl_FragColor = texture2D(u_fx, uv);
// 						}
// 					`}
//             uniforms={{
//                u_fx: { value: null },
//             }}
//          />
//       </mesh>
//    );
// };
