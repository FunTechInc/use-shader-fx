"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { PerformanceMonitor } from "@react-three/drei";
import { Demo } from "./_demo";

// import CreateShaderFx from "@/CreateShaderFx";

export const ShaderFx = () => {
   const [dpr, setDpr] = useState(1.5);
   return (
      <Canvas dpr={dpr}>
         <PerformanceMonitor
            factor={1}
            onChange={({ factor }) => {
               console.log(`dpr:${dpr}`);
               setDpr(Math.round((0.2 + 1.3 * factor) * 10) / 10);
            }}>
            <Suspense fallback={null}>
               {/* When creating fx, please rewrite to CreateShaderFx */}
               <Demo />
            </Suspense>
            <Perf position={"bottom-left"} minimal={false} />
         </PerformanceMonitor>
      </Canvas>
   );
};
