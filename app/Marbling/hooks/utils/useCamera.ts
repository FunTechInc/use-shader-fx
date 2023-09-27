import * as THREE from "three";
import { useCallback, useEffect, useRef } from "react";
import { useWindowResizeObserver } from "@funtech-inc/spice";

const getCameraProps = (width: number, height: number) => {
   const frustumSize = height;
   const aspect = width / height;
   const [w, h] = [(frustumSize * aspect) / 2, frustumSize / 2];
   return { width: w, height: h, near: -1000, far: 1000 };
};

export const useCamera = () => {
   const camera = useRef<THREE.OrthographicCamera>();
   useEffect(() => {
      const { width, height, near, far } = getCameraProps(
         window.innerWidth,
         window.innerHeight
      );
      camera.current = new THREE.OrthographicCamera(
         -width,
         width,
         height,
         -height,
         near,
         far
      );
   }, []);
   //resize
   const handleResize = useCallback((wWidth: number, wHeight: number) => {
      if (!camera.current) {
         return;
      }
      const { width, height } = getCameraProps(wWidth, wHeight);
      camera.current.left = -width;
      camera.current.right = width;
      camera.current.top = height;
      camera.current.bottom = -height;
      camera.current.updateProjectionMatrix();
   }, []);
   useWindowResizeObserver({
      callback: ({ winW, winH }) => {
         handleResize(winW, winH);
      },
      debounce: 100,
      dependencies: [],
   });
   return camera;
};
