import { Dpr } from "../fxs/types";

export const getDpr = (
   dpr: Dpr
): { shader: number | false; fbo: number | false } => {
   if (typeof dpr === "number") {
      return { shader: dpr, fbo: dpr };
   }
   // use dpr if `shader` and `fbo` are undefined
   return {
      shader: (dpr.effect?.shader ?? true) && dpr.dpr,
      fbo: (dpr.effect?.fbo ?? true) && dpr.dpr,
   };
};
