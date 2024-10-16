import * as THREE from "three";
import { useState } from "react";
import { HooksReturn, RootState } from "../hooks/types";
import { FxTypes, FxProps } from "../hooks";

export type FxConfig<T extends FxTypes = FxTypes> = {
   fx: T;
} & FxProps<T>;

export type PipelineConfig = {
   src?: number;
   mixSrc?: number;
   mixDst?: number;
};

export type PipelineValues = {
   src?: THREE.Texture;
   mixSrc?: THREE.Texture;
   mixDst?: THREE.Texture;
};

const WARN_TEXT = {
   args: `use-shader-fx: fx and args length mismatch. fx is non-reactive; update by changing the key to reset state.`,
   pipeline: `use-shader-fx: fx and pipeline length mismatch. fx is non-reactive; update by changing the key to reset state.`,
};

export const usePipeline = <T extends FxTypes[]>(
   ...args: { [K in keyof T]: FxConfig<T[K]> }
) => {
   // hooks are non-reactive
   const [hooks] = useState(() => args.map(({ fx }) => fx));

   // to update the resolution, make the args reactive.
   let _args = args.map(({ fx, ...rest }) => rest);

   const argsDiff = hooks.length - _args.length;

   if (argsDiff !== 0) {
      console.warn(WARN_TEXT.args);
      // adjust length of args
      if (argsDiff < 0) {
         _args = _args.slice(0, hooks.length);
      } else {
         _args = _args.concat(Array(argsDiff).fill(_args.at(-1)));
      }
   }

   const pipeline: HooksReturn[] = [];
   hooks.forEach((hook, i) => pipeline.push(hook(_args[i])));

   const render = (state: RootState) =>
      pipeline.forEach((fx) => fx.render(state));
   const setValues = (...values: {}[]) =>
      pipeline.forEach((fx, i) => fx.setValues(values[i]));

   const textures = pipeline.map((fx) => fx.texture);

   const setPipeline = (...args: PipelineConfig[]) => {
      if (args.length !== pipeline.length) {
         console.warn(WARN_TEXT.pipeline);
         return;
      }
      args.forEach(({ src, mixSrc, mixDst }, i) => {
         const value: PipelineValues = {};
         if (src != null) value.src = textures[src];
         if (mixSrc != null) value.mixSrc = textures[mixSrc];
         if (mixDst != null) value.mixDst = textures[mixDst];
         pipeline[i].setValues(value);
      });
   };

   return {
      render,
      setValues,
      setPipeline,
      texture: pipeline.at(-1)?.texture,
      textures,
      pipeline,
   };
};
