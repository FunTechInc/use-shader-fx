"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { CanvasState } from "../../CanvasState";
import s from "./index.module.scss";

export const TargetUI = () => {
   const canvasState = CanvasState.getInstance();
   const containerRef = useRef<HTMLDivElement>(null);
   const rafID = useRef<number>(0);

   useEffect(() => {
      const container = containerRef.current!;
      const touchUIs = container.querySelectorAll(".js_touchUI");

      const handleFrame = () => {
         let tick = canvasState.clockState.waiting;

         touchUIs.forEach((ui, i) => {
            const touchUI = ui as HTMLElement;
            touchUI.style.opacity = tick.toString();
            touchUI.style.translate = `${(
               tick *
               16 *
               (i ? -1 : 1)
            ).toString()}px`;
         });

         if (tick !== 0 || canvasState.stickerState.isNotSticked) {
            requestAnimationFrame(handleFrame);
         }
      };

      rafID.current = requestAnimationFrame(handleFrame);
      return () => cancelAnimationFrame(rafID.current);
   }, [canvasState]);

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
