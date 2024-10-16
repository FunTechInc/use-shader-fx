import * as THREE from "three";
import { useState } from "react";
import { HooksProps, HooksReturn, RootState } from "../hooks/types";
import { BasicFxValues } from "../materials/core/BasicFxLib";
import { FxTypes } from "../hooks";

export type FxConfig = {
   fx: FxTypes;
} & HooksProps &
   BasicFxValues;

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

/*===============================================
- Generates a pipeline of fx
- hooks are non-reactive
===============================================*/
export const usePipeline = (...args: FxConfig[]) => {
   // non reactive
   const [hooks] = useState(() => args.map(({ fx }) => fx));

   // resolutionを更新するため、argsはreactiveにする
   let _args = args.map(({ fx, ...rest }) => rest);

   const argsDiff = hooks.length - _args.length;

   if (argsDiff !== 0) {
      console.warn(WARN_TEXT.args);
      // argsの長さを調整する
      if (argsDiff < 0) {
         _args = _args.slice(0, hooks.length);
      } else {
         _args = _args.concat(Array(argsDiff).fill(_args.at(-1)));
      }
   }

   // hooksからの返り値を格納する
   const pipeline: HooksReturn[] = [];
   hooks.forEach((hook, i) => pipeline.push(hook(_args[i])));

   const render = (state: RootState) =>
      pipeline.forEach((fx) => fx.render(state));
   const setValues = (...values: {}[]) =>
      pipeline.forEach((fx, i) => fx.setValues(values[i]));

   // setPipiline
   const textures = pipeline.map((fx) => fx.texture);

   const setPipeline = (...args: PipelineConfig[]) => {
      if (args.length !== pipeline.length) {
         console.warn(WARN_TEXT.pipeline);
         return;
      }
      args.forEach(({ src, mixSrc, mixDst }, i) => {
         const value: PipelineValues = {};
         if (src !== undefined) value.src = textures[src];
         if (mixSrc !== undefined) value.mixSrc = textures[mixSrc];
         if (mixDst !== undefined) value.mixDst = textures[mixDst];
         pipeline[i].setValues(value);
      });
   };

   return {
      render,
      setValues,
      texture: pipeline.at(-1)?.texture,
      textures,
      setPipeline,
   };
};
