import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { useFrame, useThree, createPortal } from "@react-three/fiber";
import {
   useNoise,
   useFluid,
   useFxBlending,
   useColorStrata,
   useBrightnessPicker,
   useSingleFBO,
} from "@/packages/use-shader-fx/src";

function Box(props: any) {
   // This reference will give us direct access to the mesh
   const meshRef = useRef<THREE.Mesh>();
   // Set up state for the hovered and active state
   const [hovered, setHover] = useState(false);
   const [active, setActive] = useState(false);
   // Subscribe this component to the render-loop, rotate the mesh every frame
   useFrame((state, delta) => {
      meshRef.current!.rotation.x += delta;
      meshRef.current!.rotation.y -= delta;
   });
   // Return view, these are regular three.js elements expressed in JSX
   return (
      <mesh
         {...props}
         ref={meshRef}
         scale={active ? 2 : 1.5}
         onClick={(event) => setActive(!active)}
         onPointerOver={(event) => setHover(true)}
         onPointerOut={(event) => setHover(false)}>
         <boxGeometry args={[1, 1, 1]} />
         <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
      </mesh>
   );
}

export const Home = () => {
   const ref = useRef<THREE.ShaderMaterial>(null);
   const { size, viewport, camera } = useThree();
   const dpr = viewport.dpr;
   const [updateNoise, setNoise] = useNoise({ size, dpr });
   const [updateFluid, setFluid] = useFluid({ size, dpr });
   const [updateFxBlending, setFxBlending] = useFxBlending({ size, dpr });
   const [updateColorStrata, setColorStrata] = useColorStrata({ size, dpr });
   const [updateBrightnessPicker] = useBrightnessPicker({
      size,
      dpr,
   });

   setFxBlending({
      mapIntensity: 0.45,
   });

   setNoise({
      scale: 0.01,
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
      laminateLayer: 4,
      laminateInterval: new THREE.Vector2(1, 1),
      laminateDetail: new THREE.Vector2(0.3, 0.3),
      distortion: new THREE.Vector2(2, 2),
      colorFactor: new THREE.Vector3(6.2, 4.2, 8.8),
      timeStrength: new THREE.Vector2(1, 1),
      noiseStrength: new THREE.Vector2(1, 1),
   });

   // This scene is rendered offscreen
   const offscreenScene = useMemo(() => new THREE.Scene(), []);

   // create FBO for offscreen rendering
   const [_, updateRenderTarget] = useSingleFBO({
      scene: offscreenScene,
      camera,
      size,
      dpr: viewport.dpr,
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
         noise: noise,
      });
      ref.current!.uniforms.u_fx.value = colorStrata;
      ref.current!.uniforms.u_texture.value = updateRenderTarget(props.gl);
   });

   return (
      <>
         {createPortal(
            <mesh>
               <ambientLight intensity={Math.PI} />
               <spotLight
                  position={[10, 10, 10]}
                  angle={0.15}
                  penumbra={1}
                  decay={0}
                  intensity={Math.PI}
               />
               <pointLight
                  position={[-10, -10, -10]}
                  decay={0}
                  intensity={Math.PI}
               />
               <Box position={[-1.5, 0, 0]} />
               <Box position={[1.5, 0, 0]} />
            </mesh>,
            offscreenScene
         )}
         <mesh>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
               ref={ref}
               transparent
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
						uniform sampler2D u_texture;

						void main() {
							vec2 uv = vUv;
							vec3 noiseMap = texture2D(u_fx, uv).rgb;
							vec3 nNoiseMap = noiseMap * 2.0 - 1.0;
							uv = uv * 2.0 - 1.0;
							uv *= mix(vec2(1.0), abs(nNoiseMap.rg), 1.);
							uv = (uv + 1.0) / 2.0;

							vec3 texColor = texture2D(u_texture, uv).rgb;
							vec3 color = mix(texColor,noiseMap,0.5);

							float luminance = length(color);
							
							float edge0 = 0.0;
							float edge1 = .2;
							float alpha = smoothstep(edge0, edge1, luminance);

							gl_FragColor = vec4(color,alpha);

						}
					`}
               uniforms={{
                  u_texture: { value: null },
                  u_fx: { value: null },
               }}
            />
         </mesh>
      </>
   );
};
