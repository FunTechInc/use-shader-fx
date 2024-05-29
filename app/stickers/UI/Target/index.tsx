"use client";

import { useRef } from "react";
import Image from "next/image";
import { CanvasState } from "../../CanvasState";
import s from "./index.module.scss";
import { useFrame } from "@funtech-inc/spice";

export const TargetUI = () => {
   const canvasState = CanvasState.getInstance();
   const containerRef = useRef<HTMLDivElement>(null);

   useFrame(() => {
      let tick = canvasState.clockState.waiting;
      if (tick === 0 && !canvasState.stickerState.isNotSticked) {
         return;
      }
      const container = containerRef.current;
      if (!container) {
         return;
      }
      const touchUIs = container.querySelectorAll(".js_touchUI");
      touchUIs.forEach((ui, i) => {
         const touchUI = ui as HTMLElement;
         touchUI.style.opacity = tick.toString();
         touchUI.style.translate = `${(tick * 16 * (i ? -1 : 1)).toString()}px`;
      });
   });

   return (
      <div ref={containerRef} className={s.container}>
         {[...Array(2)].map((_, i) => (
            <div key={i} className={`${s.touch} js_touchUI`}>
               <Image
                  src={"stickers/UI/touch.svg"}
                  alt="touch"
                  width={32}
                  height={75}
               />
            </div>
         ))}
      </div>
   );
};
