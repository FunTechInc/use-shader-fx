"use client";

const isDev = process.env.NODE_ENV === "development";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { PerformanceMonitor } from "@react-three/drei";
import { Demo } from "./Demo";
import { CreateKit } from "./CreateKit";

// Create scene is rendered if develop environment and isCreate is true
const isCreate = true;

export const ShaderFx = () => {
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
               {isDev && isCreate ? <CreateKit /> : <Demo />}
            </Suspense>
            <Perf position={"bottom-right"} minimal={false} />
         </PerformanceMonitor>
      </Canvas>
   );
};
