"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { Perf } from "r3f-perf";
import { PerformanceMonitor } from "@react-three/drei";

export const Fx = () => {
   const [dpr, setDpr] = useState(1.5);
   return (
      <Canvas dpr={dpr}>
         <PerformanceMonitor
            factor={1}
            onChange={({ factor }) => {
               console.log(`dpr:${dpr}`);
               setDpr(Math.round((0.5 + 1.5 * factor) * 10) / 10);
            }}>
            <Suspense fallback={null}>
               <Scene />
            </Suspense>
            <Perf position={"bottom-right"} minimal={false} />
         </PerformanceMonitor>
      </Canvas>
   );
};
