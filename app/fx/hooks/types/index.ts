import { RootState } from "@react-three/fiber";

export type HooksReturn<T, O> = [
   /**
    * An update function that returns THREE.Texture. Call it inside useFrame
    * @param props RootState
    * @param params params of hooks
    */
   (props: RootState, params: T) => THREE.Texture,
   /**
    * @param params params of hooks
    */
   (params: T) => void,
   fxObject: O
];
