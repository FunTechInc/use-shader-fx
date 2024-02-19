"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   useNoise,
   useFluid,
   useFxBlending,
   useColorStrata,
   useBrightnessPicker,
   useChromaKey,
   useBeat,
   useRipple,
   useMarble,
   useFxTexture,
   useBrush,
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
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import { useTexture, useVideoTexture } from "@react-three/drei";
import { Console } from "console";

extend({ FxMaterial });

/*===============================================
TODO:
~~ 初期状態で真ん中に来ないようにする ~~

- falloffつける:速度に応じて小さくなって消滅する係数
	- disipaccionと関係sる値
- uniform名、変数名を満足いくものにする

- colorをfluidみたく関数しましょっか

- パフォーマンス

- あんまうまくいかなかったら、useFlowmapを別途つくる？
	- パクリすぎるかも？
===============================================*/

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();

   const { size, viewport } = useThree();
   // const bbbb = useVideoTexture("/bbbb.mov");
   // const glitch = useVideoTexture("/glitch.mov");
   const [updateBrush, setBrush, { output }] = useBrush({
      size,
      dpr: viewport.dpr,
   });

   setBrush({
      radius: 0.4,
      smudge: 4,
      motionBlur: 3,
      motionSample: 8,
      dissipation: 0.93,
   });

   // const updateBeat = useBeat(157);

   useFrame((props) => {
      updateBrush(props);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} u_fx={output} ref={ref} />
      </mesh>
   );
};
