"use client";

import { ShaderFx } from "../ShaderFx";
import { Playground } from "./Playground";
import { useState } from "react";
import Image from "next/image";
import s from "./index.module.scss";

export default function Page() {
   const [bpm, setBpm] = useState(120);
   return (
      <div className={s.wrapper}>
         <div className={s.canvas}>
            <ShaderFx>
               <Playground bpm={bpm} />
            </ShaderFx>
         </div>
         <div className={s.content}>
            <h1 className={s.title}>⚡️ More FXs, Less GLSL</h1>
            <p className={s.install}>npm install @funtech-inc/use-shader-fx</p>
            <p className={s.link}>
               Oh, right, u can download the background gradient from
               <a href="/gradation" target="_blank">
                  here 👉
               </a>
            </p>
            <div className={s.bpmSelector}>
               <p>BPM:</p>
               <input
                  type="number"
                  value={bpm}
                  onChange={(e) => {
                     setBpm(+e.target.value);
                  }}
               />
            </div>
         </div>
         <ul
            style={{
               position: "fixed",
               bottom: "16px",
               right: "16px",
               zIndex: 100,
               display: "flex",
               alignItems: "center",
               gap: "16px",
               mixBlendMode: "difference",
            }}>
            <li>
               <a
                  href="https://github.com/FunTechInc/use-shader-fx"
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
