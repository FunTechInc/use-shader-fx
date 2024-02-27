import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   useNoise,
   useColorStrata,
   useMarble,
   useHSV,
   useBeat,
   useBrush,
   useCoverTexture,
   usePointer,
   useFPSLimiter,
   EasingTypes,
   ColorStrataParams,
   HSVParams,
   MarbleParams,
} from "@/packages/use-shader-fx/src";

import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import { useVideoTexture } from "@react-three/drei";

extend({ FxMaterial });

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
   const ref = useRef<FxMaterialProps>();
   const { size, viewport } = useThree();
   const funkun = useVideoTexture("/FT_Ch02.mp4");

   const [updateNoise, setNoise, { output: noise }] = useNoise({
      size,
      dpr: viewport.dpr,
   });
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
   const [updateBrush, setBrush, { output: brush }] = useBrush({
      size,
      dpr: viewport.dpr,
   });
   const [updateCover, setCover, { output: cover }] = useCoverTexture({
      size,
      dpr: viewport.dpr,
   });

   useEffect(() => {
      CONFIG.random();
      setNoise({
         scale: 1000,
         warpOctaves: 1,
         noiseOctaves: 1,
         fbmOctaves: 1,
         timeStrength: 1,
      });

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

      setCover({
         texture: funkun,
      });

      setBrush({
         map: noise,
         texture: cover,
         mapIntensity: 0.35,
         radius: 0.2,
         dissipation: 0.9,
         isCursor: true,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const beting = useBeat(bpm, easing);
   const updatePointer = usePointer(0.8);
   const limiter = useFPSLimiter(40);
   const hashMemo = useRef(0);

   useFrame((props) => {
      if (!limiter(props.clock)) {
         return;
      }
      const { beat, hash } = beting(props.clock);
      if (hash !== hashMemo.current) {
         hashMemo.current = hash;
         CONFIG.random();
      }
      updateNoise(props);
      updateColorStrata(props, {
         ...(setConfig("colorStrata") as ColorStrataParams),
      });
      updateHSV(props, {
         ...(setConfig("hsv") as HSVParams),
      });
      updateMarble(props, {
         ...(setConfig("marble") as MarbleParams),
         beat: beat,
      });
      updateCover(props);
      const pointerValues = updatePointer(props.pointer);
      updateBrush(props, {
         pointerValues: pointerValues,
      });
      ref.current!.u_noiseIntensity = CONFIG.noiseIntensity;
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial
            key={FxMaterial.key}
            u_noise={marble}
            u_grain={noise}
            u_colorStrata={hsv}
            u_brush={brush}
            ref={ref}
         />
      </mesh>
   );
};
