import * as THREE from "three";
import { useFBO } from "@react-three/drei";
import { useWindowResizeObserver } from "@funtech-inc/spice";
import { useRef } from "react";

export type TRenderTarget = {
   read: THREE.WebGLRenderTarget | null;
   write: THREE.WebGLRenderTarget | null;
   swap: () => void;
};

const FBO_OPTION = {
   depthBuffer: false,
   stencilBuffer: false,
};

export const useRenderTarget = () => {
   const renderTarget = useRef<TRenderTarget>({
      read: null,
      write: null,
      swap: function () {
         let temp = this.read;
         this.read = this.write;
         this.write = temp;
      },
   });

   //set FBO
   renderTarget.current.read = useFBO(FBO_OPTION);
   renderTarget.current.write = useFBO(FBO_OPTION);
   renderTarget.current.swap();

   //resize
   useWindowResizeObserver({
      callback: ({ winW, winH }) => {
         renderTarget.current.read?.setSize(winW, winH);
         renderTarget.current.write?.setSize(winW, winH);
      },
      debounce: 100,
      dependencies: [],
   });

   return renderTarget.current;
};
