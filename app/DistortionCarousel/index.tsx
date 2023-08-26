"use client";

import * as THREE from "three";
import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { Distortion } from "./Distortion";

export const DistortionCarousel = () => {
   return (
      <Canvas dpr={[1, 1.5]}>
         <Suspense fallback={null}>
            <Distortion />
         </Suspense>
      </Canvas>
   );
};
