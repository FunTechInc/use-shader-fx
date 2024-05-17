import * as THREE from "three";
import { useCallback, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
   useColorStrata,
   useMarble,
   useHSV,
   useBeat,
   useFPSLimiter,
   EasingTypes,
   ColorStrataParams,
   HSVParams,
   MarbleParams,
   useBlank,
} from "@/packages/use-shader-fx/src";

import { Environment, OrbitControls } from "@react-three/drei";
import { OnBeforeInitParameters } from "@/packages/use-shader-fx/src/fxs/types";

export const CONFIG = {
   marble: {
      pattern: 10,
      complexity: 1.5,
      complexityAttenuation: 0.2,
      scale: 0.002,
      iterations: 3,
   },
   colorStrata: {
      laminateLayer: 6,
      scale: 0.2,
      laminateInterval: new THREE.Vector2(0.55, 0.23),
      laminateDetail: new THREE.Vector2(0, 3.5),
      distortion: new THREE.Vector2(1.64, 4.22),
      colorFactor: new THREE.Vector3(0.6, 0.1, 0),
   },
   hsv: {
      brightness: 0.8,
      saturation: 0.8,
   },
   noiseIntensity: 2,
   random: () => {
      CONFIG.marble.pattern = Math.random() * 1000;
      CONFIG.marble.complexity = Math.random() * 10;
      CONFIG.marble.complexityAttenuation = Math.random();
      CONFIG.marble.scale = Math.random() * 0.001;
      CONFIG.marble.iterations = Math.floor(Math.random() * 4) + 1;
      CONFIG.colorStrata.laminateLayer = Math.max(
         Math.floor(Math.random() * 6),
         1
      );
      CONFIG.colorStrata.scale = Math.max(Math.random(), 0.1);
      CONFIG.colorStrata.laminateInterval = new THREE.Vector2(
         Math.max(Math.random(), 0.2),
         Math.max(Math.random(), 0.2)
      );
      CONFIG.colorStrata.laminateDetail = new THREE.Vector2(
         Math.random() * 8,
         Math.random() * 8
      );
      CONFIG.colorStrata.distortion = new THREE.Vector2(
         Math.random() * 10,
         Math.random() * 10
      );
      CONFIG.colorStrata.colorFactor = new THREE.Vector3(
         Math.random(),
         Math.random(),
         Math.random()
      );
      CONFIG.noiseIntensity = Math.random() * 20;
   },
};

const setConfig = (key: "marble" | "colorStrata" | "hsv") => {
   return {
      ...CONFIG[key],
   };
};

export const Playground = ({
   bpm,
   easing,
}: {
   bpm: number;
   easing: EasingTypes;
}) => {
   const { size, viewport } = useThree();

   // init fxs
   const [updateColorStrata, setColorStrata, { output: colorStrata }] =
      useColorStrata({ size, dpr: viewport.dpr });
   const [updateMarble, setMarble, { output: marble }] = useMarble({
      size,
      dpr: viewport.dpr,
   });
   const [updateHSV, setHSV, { output: hsv }] = useHSV({
      size,
      dpr: viewport.dpr,
   });
   const [updateBlank, _, { output: blank }] = useBlank({
      size,
      dpr: viewport.dpr,
      onBeforeInit: useCallback((params: OnBeforeInitParameters) => {
         Object.assign(params.uniforms, {
            u_noise: {
               value: marble,
            },
            u_noiseIntensity: {
               value: CONFIG.noiseIntensity,
            },
            u_colorStrata: {
               value: hsv,
            },
         });
         params.fragmentShader = params.fragmentShader.replace(
            "#usf <uniforms>",
            `
					uniform sampler2D u_noise;
					uniform float u_noiseIntensity;
					uniform sampler2D u_colorStrata;
					float rand(vec2 n) { 
						return fract(sin(dot(n ,vec2(12.9898,78.233))) * 43758.5453);
					}
			`
         );
         params.fragmentShader = params.fragmentShader.replace(
            "#usf <main>",
            `
					vec2 uv = vUv;
					float grain=rand(uv+sin(uTime))*.4;
					grain=grain*.5+.5;
					vec4 noise = texture2D(u_noise, uv);
					uv += noise.rg * u_noiseIntensity;
					vec4 colorStrata = texture2D(u_colorStrata,uv);
					usf_FragColor = colorStrata*grain;
			`
         );
      }, []),
   });

   // set fxs
   setMarble({
      ...setConfig("marble"),
      timeStrength: 0.5,
   });
   setColorStrata({
      ...setConfig("colorStrata"),
      timeStrength: new THREE.Vector2(0, 0),
   });
   setHSV({
      ...setConfig("hsv"),
      texture: colorStrata,
   });

   useMemo(() => {
      CONFIG.random();
   }, []);

   const beting = useBeat(bpm, easing);
   const limiter = useFPSLimiter(40);
   const hashMemo = useRef(0);
   const meshRef = useRef<THREE.Mesh>(null);

   useFrame((state) => {
      if (!limiter(state.clock)) {
         return;
      }
      const { beat, hash, fract } = beting(state.clock);
      if (hash !== hashMemo.current) {
         hashMemo.current = hash;
         CONFIG.random();
      }
      updateColorStrata(state, {
         ...(setConfig("colorStrata") as ColorStrataParams),
      });
      updateHSV(state, {
         ...(setConfig("hsv") as HSVParams),
      });
      updateMarble(state, {
         ...(setConfig("marble") as MarbleParams),
         beat: beat,
      });
      updateBlank(
         state,
         {},
         {
            u_noiseIntensity: CONFIG.noiseIntensity,
         }
      );
      meshRef.current!.rotation.x += 0.03 * fract;
      meshRef.current!.rotation.y += 0.04 * fract;
      meshRef.current!.rotation.z += 0.05 * fract;
      meshRef.current!.position.z = Math.sin(fract) * 0.08;
   });

   return (
      <mesh>
         <mesh ref={meshRef}>
            <boxGeometry args={[3, 3, 3]} />
            <meshStandardMaterial
               map={blank}
               roughness={0.05}
               metalness={0.4}
            />
         </mesh>
         <Environment preset="warehouse" environmentIntensity={0.5} />
         <OrbitControls />
      </mesh>
   );
};
