import { Dpr } from "../hooks/types";

export const getDpr = (
   dpr: Dpr
): { shader: number | false; fbo: number | false } => {
   if (typeof dpr === "number") {
      return { shader: dpr, fbo: dpr };
   }
   return {
      shader: dpr.shader ?? false,
      fbo: dpr.fbo ?? false,
   };
};
