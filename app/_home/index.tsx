"use client";

import { ShaderFx } from "../ShaderFx";
import { Playground } from "./Playground";
import { useState } from "react";
import { EasingTypes } from "@/packages/use-shader-fx/src";
import Image from "next/image";
import s from "./index.module.scss";

const Install = () => {
   const [copied, setIsCopied] = useState(false);
   return (
      <button
         onClick={(e) => {
            const target = e.target as HTMLButtonElement;
            navigator?.clipboard?.writeText(target.innerText).then(() => {
               setIsCopied(true);
            });
         }}
         className={`${s.install} ${copied ? s.copied : ""}`}>
         npm install @funtech-inc/use-shader-fx
         <Image src="copy.svg" alt="Copy" width={12} height={12} />
      </button>
   );
};

export default function Page() {
   const [bpm, setBpm] = useState(120);
   const [easing, setEasing] = useState<EasingTypes>("easeOutQuad");

   const easingTypes: EasingTypes[] = [
      "easeInSine",
      "easeOutSine",
      "easeInOutSine",
      "easeInQuad",
      "easeOutQuad",
      "easeInOutQuad",
      "easeInCubic",
      "easeOutCubic",
      "easeInOutCubic",
      "easeInQuart",
      "easeOutQuart",
      "easeInOutQuart",
      "easeInQuint",
      "easeOutQuint",
      "easeInOutQuint",
      "easeInExpo",
      "easeOutExpo",
      "easeInOutExpo",
      "easeInCirc",
      "easeOutCirc",
      "easeInOutCirc",
      "easeInBack",
      "easeOutBack",
      "easeInOutBack",
      "easeInElastic",
      "easeOutElastic",
      "easeInOutElastic",
      "easeInBounce",
      "easeOutBounce",
      "easeInOutBounce",
   ];

   return (
      <>
         <div className={s.canvas}>
            <ShaderFx>
               <Playground bpm={bpm} easing={easing} />
            </ShaderFx>
         </div>
         <div className={s.wrapper}>
            <div className={s.content}>
               <h1 className={s.title}>⚡️ More FXs, Less GLSL</h1>
               <Install />
               <p className={s.link}>
                  Oh, right, u can download the gradient from
                  <a href="/gradation" target="_blank">
                     here 👉
                  </a>
               </p>
               <div className={s.input}>
                  <p>BPM:</p>
                  <input
                     type="number"
                     value={bpm}
                     onChange={(e) => {
                        setBpm(+e.target.value);
                     }}
                  />
               </div>
               <div className={s.input}>
                  <p>Easing:</p>
                  <select
                     value={easing}
                     onChange={(e) => {
                        setEasing(e.target.value as EasingTypes);
                     }}>
                     {easingTypes.map((type) => (
                        <option key={type} value={type}>
                           {type}
                        </option>
                     ))}
                  </select>
               </div>
            </div>
            <ul className={s.snsLink}>
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
      </>
   );
}
