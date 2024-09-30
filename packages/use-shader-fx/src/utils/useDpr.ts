import { useMemo } from "react";
import { Dpr } from "../fxs/types";

export const useDpr = (
   dpr: Dpr
): { shader: number | false; fbo: number | false } => {
   const _dpr = useMemo(() => {
      if (typeof dpr === "number") {
         return { shader: dpr, fbo: dpr };
      }
      return {
         shader: dpr.shader ?? false,
         fbo: dpr.fbo ?? false,
      };
   }, [dpr]);

   return _dpr;
};
