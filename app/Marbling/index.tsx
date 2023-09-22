"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { FBOScene } from "./FBOScene";
import { UserInterface } from "./UI";

export const Marbling = () => {
   return (
      <>
         <Suspense fallback={null}>
            <Canvas dpr={[1, 1.5]}>
               <FBOScene />
            </Canvas>
         </Suspense>
         {/* <UserInterface /> */}
      </>
   );
};
