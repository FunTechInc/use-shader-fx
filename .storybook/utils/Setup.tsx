"use client";
import * as React from "react";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { PerformanceMonitor } from "@react-three/drei";

export const Setup = ({ children }: { children: React.ReactNode }) => {
   const [dpr, setDpr] = useState(1.5);
   return (
      <Canvas dpr={dpr}>
         <PerformanceMonitor
            factor={1}
            onChange={({ factor }) => {
               console.log(`dpr:${dpr}`);
               setDpr(Math.round((0.5 + 1.0 * factor) * 10) / 10);
            }}>
            {children}
            <Perf position={"bottom-left"} minimal={false} />
         </PerformanceMonitor>
      </Canvas>
   );
};
