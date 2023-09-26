import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useWindowResizeObserver } from "@funtech-inc/spice";

const getCameraProps = () => {
   const frustumSize = window.innerHeight;
   const aspect = window.innerWidth / window.innerHeight;
   const [w, h] = [(frustumSize * aspect) / 2, frustumSize / 2];
   return { width: w, height: h, near: -1000, far: 1000 };
};

export const useCamera = () => {
   const camera = useRef<THREE.OrthographicCamera>();
   useEffect(() => {
      const { width, height, near, far } = getCameraProps();
      camera.current = new THREE.OrthographicCamera(
         -width,
         width,
         height,
         -height,
         near,
         far
      );
   }, []);
   const handleResize = () => {
      if (!camera.current) {
         return;
      }
      const { width, height } = getCameraProps();
      camera.current.left = -width;
      camera.current.right = width;
      camera.current.top = height;
      camera.current.bottom = -height;
      camera.current.updateProjectionMatrix();
   };
   useWindowResizeObserver({
      callback: () => {
         handleResize();
      },
      debounce: 100,
      dependencies: [],
   });
   return camera;
};
