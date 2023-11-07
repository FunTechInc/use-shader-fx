import { useRef } from "react";
import * as THREE from "three";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { FxMaterial, TFxMaterial } from "./fxMaterial";
import { usePerformanceMonitor } from "@react-three/drei";
import { useGUI } from "./useGUI";
import { CONFIG } from "./config";
import { useNoise } from "./useNoise";

// dreiのshaderMaterialを使うことで、key={FxMaterial.key}を有効にすることができ、hotReloadが使えます。
extend({ FxMaterial });

/**
 * 新しいFXを作成するためのシーンです。CONFIGのisCreateをtrueにすることで、development環境でのみレンダリングされます。
 */
export const CreateKit = () => {
   const updateGUI = useGUI();
   const fxRef = useRef<TFxMaterial>();

   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);

   const [updateNoise, setNoise, noiseObj] = useNoise({ size, dpr });

   // factorに応じたパフォーマンスコントロールを考慮して、setParams関数は作成してください。
   usePerformanceMonitor({
      onChange({ factor }) {
         // updateNoise({ : factor });
      },
   });

   useFrame((props) => {
      const fx = updateNoise(props, {
         timeStrength: CONFIG.noise.timeStrength,
         noiseOctaves: CONFIG.noise.noiseOctaves,
         fbmOctaves: CONFIG.noise.fbmOctaves,
      });
      fxRef.current!.u_fx = fx;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};
