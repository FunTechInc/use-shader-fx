import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, TFxMaterial } from "../utils/fxMaterial";
import { useDuoTone, useTransitionBg } from "../../packages/use-shader-fx/src";
import { DuoToneParams } from "../../packages/use-shader-fx/src/hooks/useDuoTone";
import { CONSTANT } from "../constant";

extend({ FxMaterial });

/**
 * テクスチャーを受け取って、DuoToneにしてテクスチャーを返します。
 */
export const UseDuoTone = (args: DuoToneParams) => {
   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);
   const fxRef = React.useRef<TFxMaterial>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateTransitionBg] = useTransitionBg({ size, dpr });
   const [updateDuoTone] = useDuoTone({ size });

   useFrame((props) => {
      const bgTexture = updateTransitionBg(props, {
         imageResolution: CONSTANT.imageResolution,
         texture0: bg,
      });
      const fx = updateDuoTone(props, {
         texture: bgTexture,
         color0: args.color0,
         color1: args.color1,
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
