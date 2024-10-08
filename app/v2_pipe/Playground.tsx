"use client";

import * as THREE from "three";
import { useCallback, useMemo, useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   useNoise,
   useBlur,
   useSingleFBO,
   createFxMaterialImpl,
   createFxBasicFxMaterialImpl,
   FxMaterialImplValues,
   FxBasicFxMaterialImplValues,
   useFluid,
} from "@/packages/use-shader-fx/src";
import {
   HooksProps,
   HooksReturn,
   RootState,
} from "@/packages/use-shader-fx/src/hooks/types";
import { BasicFxValues } from "@/packages/use-shader-fx/src/materials/BasicFxLib";

const FxMaterialImpl = createFxMaterialImpl();
const FxBasicFxMaterialImpl = createFxBasicFxMaterialImpl();

extend({ FxMaterialImpl, FxBasicFxMaterialImpl });

/*===============================================
fxのパイプラインをつくる
const {render,texture} = compose({type,size,dpr,config},{type,size,dpr,config});
- Generates a pipeline of fx
- Automatically receives one previous texture as mixSrc
===============================================*/

type FxConfig = {
   fx: typeof useFluid | typeof useNoise;
} & HooksProps &
   BasicFxValues;

const compose = (...configs: FxConfig[]) => {
   const fxArr: HooksReturn[] = [];
   configs.forEach(({ fx, ...rest }, i) =>
      fxArr.push(
         fx({
            ...rest,
            mixSrc: fxArr[i - 1]?.texture,
         })
      )
   );
   const render = (state: RootState) => fxArr.forEach((fx) => fx.render(state));
   return { render, texture: fxArr.at(-1)?.texture };
};

export const Playground = () => {
   const { size } = useThree();

   const { render, texture } = compose(
      { fx: useFluid, size, dpr: 0.4 },
      { fx: useNoise, size, dpr: 0.2, mixSrcColorFactor: 0.3 }
   );
   useFrame((state) => render(state));

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={texture} />
      </mesh>
   );
};

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterialImpl: FxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
         fxBasicFxMaterialImpl: FxBasicFxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
      }
   }
}
