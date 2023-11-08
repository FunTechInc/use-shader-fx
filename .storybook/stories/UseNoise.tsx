import * as React from "react";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { FxMaterial, TFxMaterial } from "../utils/fxMaterial";
import { useNoise } from "../../packages/use-shader-fx/src";
import { NoiseParams } from "../../packages/use-shader-fx/src/hooks/useNoise";

extend({ FxMaterial });

/**
 * noise 単体で使うというよりは、他のhookのnoiseに渡す感じで使いましょう！fxの重ねがけをするときに、noiseの計算を一度にするためです。
 */
export const UseNoise = (args: NoiseParams) => {
   const fxRef = React.useRef<TFxMaterial>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateNoise] = useNoise({ size, dpr });

   useFrame((props) => {
      const fx = updateNoise(props, {
         timeStrength: args.timeStrength,
         noiseOctaves: args.noiseOctaves,
         fbmOctaves: args.fbmOctaves,
      });
      fxRef.current!.u_fx = fx;
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};
