import { DomSyncerParams } from "..";
import { ISDEV } from "../../../libs/constants";

export const errorHandler = (params: DomSyncerParams) => {
   const domLength = params.dom?.length;
   const textureLength = params.texture?.length;
   const resolutionLength = params.resolution?.length;

   if (!domLength || !textureLength || !resolutionLength) {
      ISDEV && console.warn("No dom or texture or resolution is set");
      return true;
   }

   if (domLength !== textureLength || domLength !== resolutionLength) {
      ISDEV && console.warn("not Match dom , texture and resolution length");
      return true;
   }

   return false;
};
