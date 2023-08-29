import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type TDistortionTexture = {
   noise?: THREE.Texture | null;
   bg0?: THREE.Texture | null;
   bg1?: THREE.Texture | null;
};

export interface IAppStore {
   distortionTexture: TDistortionTexture;
   setDistortionTexture: (props: TDistortionTexture) => void;
}

//frameで呼び出さないグローバルレベルの状態管理
export const useAppStore = create<
   IAppStore,
   [["zustand/subscribeWithSelector", never]]
>(
   subscribeWithSelector((set) => ({
      distortionTexture: {
         noise: null,
         bg0: null,
         bg1: null,
      },
      setDistortionTexture: (props) =>
         set((state) => ({
            ...state,
            distortionTexture: {
               ...state.distortionTexture,
               ...props,
            },
         })),
   }))
);
