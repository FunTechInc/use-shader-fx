"use client";

import Image from "next/image";
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
         <ul
            style={{
               position: "fixed",
               bottom: "16px",
               right: "16px",
               zIndex: 100,
               display: "flex",
               alignItems: "center",
               gap: "16px",
            }}>
            <li>
               <a
                  href="https://github.com/takuma-hmng8/use-shader-fx"
                  target={"_blank"}>
                  <Image
                     src="github-logo.svg"
                     alt="GitHub"
                     width={28}
                     height={28}
                  />
               </a>
            </li>
            <li>
               <a href="https://twitter.com/tkm_hmng8" target={"_blank"}>
                  <Image src="x-logo.svg" alt="X" width={24} height={24} />
               </a>
            </li>
         </ul>
      </div>
   );
}
