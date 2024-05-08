"use client";
import * as React from "react";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { PerformanceMonitor } from "@react-three/drei";

export const Setup = ({ children }: { children: React.ReactNode }) => {
   // const [dpr, setDpr] = useState(1.5);s
   return (
      <Canvas>
         {children}
         <Perf position={"bottom-left"} minimal={false} />
      </Canvas>
   );
};
