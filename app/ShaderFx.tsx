"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { PerformanceMonitor } from "@react-three/drei";

const Loading = () => {
   return (
      <div
         style={{
            fontSize: "16px",
            color: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}>
         Loading...
      </div>
   );
};

export const ShaderFx = ({
   children,
   preserveDrawingBuffer = false,
   shadows = false,
   isDprUpdate = true,
}: {
   children: React.ReactNode;
   preserveDrawingBuffer?: boolean;
   shadows?: boolean;
   isDprUpdate?: boolean;
}) => {
   const [dpr, setDpr] = useState(1.5);
   return (
      <Suspense fallback={<Loading />}>
         <Canvas
            dpr={dpr}
            gl={{ preserveDrawingBuffer: preserveDrawingBuffer }}
            shadows={shadows}>
            <PerformanceMonitor
               factor={1}
               onChange={({ factor }) => {
                  if (preserveDrawingBuffer) {
                     return;
                  }
                  if (!isDprUpdate) {
                     return;
                  }
                  console.log(`dpr:${dpr}`);
                  setDpr(Math.round((1.0 + 1.0 * factor) * 10) / 10);
               }}>
               {children}
               <Perf position={"bottom-left"} minimal={false} />
            </PerformanceMonitor>
         </Canvas>
      </Suspense>
   );
};
