import { DomSyncerParams } from "..";

export const errorHandler = (params: DomSyncerParams) => {
   const domLength = params.dom?.length;
   const textureLength = params.texture?.length;
   const resolutionLength = params.resolution?.length;

   if (!domLength || !textureLength || !resolutionLength) {
      throw new Error("No dom or texture or resolution is set");
   }

   if (domLength !== textureLength || domLength !== resolutionLength) {
      throw new Error("Match dom, texture and resolution length");
   }
};
