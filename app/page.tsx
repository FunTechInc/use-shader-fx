"use client";

import { ShaderFx } from "./ShaderFx";
import { Home } from "./_home";

export default function Page() {
   return (
      <div style={{ width: "100%", height: "100svh", overflow: "hidden" }}>
         <ShaderFx>
            <Home />
         </ShaderFx>
         <h1
            style={{
               fontSize: "10vw",
               position: "fixed",
               top: "0px",
               zIndex: -100,
               fontWeight: 700,
               lineHeight: 1,
               textAlign: "center",
               width: "100%",
               height: "100svh",
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
            }}>
            use-shader-fx
         </h1>
      </div>
   );
}
