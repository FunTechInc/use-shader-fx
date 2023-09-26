"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { UserInterface } from "./UI";
import { Perf } from "r3f-perf";

export const Marbling = () => {
   return (
      <>
         <Canvas dpr={[1, 1.5]}>
            <Suspense fallback={null}>
               <Scene />
            </Suspense>
            <Perf position={"bottom-right"} minimal={false} />
         </Canvas>
         {/* <UserInterface /> */}
      </>
   );
};
