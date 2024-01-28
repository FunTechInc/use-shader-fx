import { DomSyncerParams } from "..";

export const errorHandler = (params: DomSyncerParams) => {
   const domLength = params.dom?.length;
   const textureLength = params.texture?.length;
   const resolutionLength = params.resolution?.length;

   if (!domLength || !textureLength || !resolutionLength) {
      return true;
   }

   if (domLength !== textureLength || domLength !== resolutionLength) {
      return true;
   }

   return false;
};
