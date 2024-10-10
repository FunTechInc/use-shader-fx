import { useState } from "react";
import { HooksProps, HooksReturn, RootState } from "../hooks/types";
import { useFluid } from "../hooks/useFluid";
import { useNoise } from "../hooks/useNoise";
import { BasicFxValues } from "../materials/core/BasicFxLib";

export type FxConfig = {
   // TODO * ここの型定義うまいことしたい /hooksにindex.tsを作ってそこでexportしてimportするとかかな
   fx: typeof useFluid | typeof useNoise;
} & HooksProps &
   BasicFxValues;

const WARN_TEXT = `use-shader-fx: fx and args length mismatch. fx is non-reactive; update by changing the key to reset state.`;

/*===============================================
- Generates a pipeline of fx
- hooks are non-reactive
- Automatically receives one previous texture as mixSrc
===============================================*/
export const useComposer = (...args: FxConfig[]) => {
   // non reactive
   const [hooks] = useState(() => args.map(({ fx }) => fx));

   // resolutionを更新するため、argsはreactiveにする
   let _args = [...args];
   const argsDiff = hooks.length - _args.length;

   if (argsDiff !== 0) {
      console.warn(WARN_TEXT);
      // argsの長さを調整する
      if (argsDiff < 0) {
         _args = _args.slice(0, hooks.length);
      } else {
         _args = _args.concat(Array(argsDiff).fill(_args.at(-1)));
      }
   }

   // hooksからの返り値を格納する
   const fxArr: HooksReturn[] = [];

   hooks.forEach((hook, i) => {
      const prev = fxArr[i - 1]?.texture;
      const { fx: _, ...rest } = _args[i];
      fxArr.push(hook({ ...rest, ...(prev && { mixSrc: prev }) }));
   });

   const render = (state: RootState) => fxArr.forEach((fx) => fx.render(state));
   const setValues = (...values: {}[]) =>
      fxArr.forEach((fx, i) => fx.setValues(values[i]));

   return { render, setValues, texture: fxArr.at(-1)?.texture };
};
