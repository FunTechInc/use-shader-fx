import { DomSyncerParams } from "..";

export const errorHandler = (params: DomSyncerParams) => {
   const domLength = params.dom?.length;
   const textureLength = params.texture?.length;

   if (!domLength || !textureLength) {
      return true;
   }

   if (domLength !== textureLength) {
      return true;
   }

   return false;
};
