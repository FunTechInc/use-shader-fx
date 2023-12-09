import { DomSyncerParams } from "../";

export const errorHandling = (params: DomSyncerParams) => {
   if (params.dom.length !== params.texture.length) {
      throw new Error("domとテクスチャーの数は一致しません！");
   }
   if (params.dom.length === 0 || params.texture.length === 0) {
      throw new Error("配列が空ですよ！");
   }
};
