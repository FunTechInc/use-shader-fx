"use client";

import * as THREE from "three";
import Image from "next/image";
import { CanvasState } from "../CanvasState";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { GifPreloader } from "./GifPreloader";
import { Confetti } from "./Confetti";
import s from "./index.module.scss";

const updateTargetPoint = (target: HTMLDivElement, point: THREE.Vector2) => {
   const targetRect = target.getBoundingClientRect();
   target.style.left = `${point.x - targetRect.width / 2}px`;
   target.style.top = `${point.y - targetRect.height / 2}px`;
};

const CURSOR_LERP = 0.8;

export const CursorUI = () => {
   const canvasState = CanvasState.getInstance();

   const [stickerIndex, setStickerIndex] = useState(
      canvasState.stickerState.nextStickerIndex
   );

   const rafID = useRef<number>(0);
   const cursorRef = useRef<HTMLDivElement>(null);
   const imageRef = useRef<HTMLImageElement>(null);
   const confettiRef = useRef<HTMLDivElement>(null);
   const pointerVec = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
   const prevIsOver = useRef(false);

   const onStickerChange = useCallback(
      (
         target: HTMLImageElement,
         confettiTarget: HTMLDivElement,
         point: THREE.Vector2
      ) => {
         setStickerIndex(canvasState.stickerState.nextStickerIndex);
         gsap.fromTo(
            target,
            {
               autoAlpha: 0,
               scale: 0,
            },
            {
               autoAlpha: 1,
               scale: 1,
               duration: 0.4,
               ease: "back.out(2)",
            }
         );
         updateTargetPoint(confettiTarget, point);
         const confettiImages = confettiTarget.querySelectorAll("img");
         gsap.fromTo(
            confettiImages,
            {
               autoAlpha: 0,
               scale: 0,
            },
            {
               autoAlpha: 1,
               scale: 1,
               duration: 0.3,
               ease: "back.out(2)",
               stagger: {
                  each: 0.03,
                  from: "random",
               },
               onComplete: () => {
                  gsap.to(confettiImages, {
                     autoAlpha: 0,
                     scale: 0,
                     duration: 0.3,
                     ease: "back.in(2)",
                     stagger: {
                        each: 0.03,
                        from: "random",
                     },
                  });
               },
            }
         );
      },
      [canvasState.stickerState]
   );

   const onOver = useCallback((target: HTMLImageElement) => {
      document.documentElement.style.cursor = "grab";
      gsap.fromTo(
         target,
         {
            autoAlpha: 0,
            scale: 0,
         },
         {
            autoAlpha: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(2)",
         }
      );
   }, []);

   const onOut = useCallback((taget: HTMLImageElement) => {
      document.documentElement.style.cursor = "initial";
      gsap.to(taget, {
         autoAlpha: 0,
         scale: 0,
         duration: 0.4,
         ease: "back.in(2)",
      });
   }, []);

   const handleFrame = useCallback(() => {
      const isOver = canvasState.cursorState.isOver;
      const target = cursorRef.current!;
      const targetImage = imageRef.current!;

      // update sticker index
      if (stickerIndex !== canvasState.stickerState.nextStickerIndex) {
         onStickerChange(
            targetImage,
            confettiRef.current!,
            canvasState.cursorState.point
         );
      }

      // onUpdate
      if (prevIsOver.current !== isOver) {
         if (isOver) {
            updateTargetPoint(
               target,
               pointerVec.current.copy(canvasState.cursorState.point)
            );
            onOver(targetImage);
         } else {
            onOut(targetImage);
         }
      }

      // loop
      if (isOver) {
         updateTargetPoint(
            target,
            pointerVec.current.lerp(canvasState.cursorState.point, CURSOR_LERP)
         );
      }
      prevIsOver.current = isOver;
      rafID.current = requestAnimationFrame(handleFrame);
   }, [
      canvasState.stickerState,
      stickerIndex,
      canvasState.cursorState,
      onStickerChange,
      onOver,
      onOut,
   ]);

   useEffect(() => {
      rafID.current = requestAnimationFrame(handleFrame);
      return () => cancelAnimationFrame(rafID.current);
   }, [handleFrame]);

   return (
      <div className={s.container}>
         <div ref={cursorRef} className={s.cursor}>
            <Image
               ref={imageRef}
               src={`/stickers/gif/gif${stickerIndex}.gif`}
               fill
               alt=""
               unoptimized
               style={{ visibility: "hidden" }}
            />
         </div>
         <div ref={confettiRef} className={s.confettiContainer}>
            <Confetti state={stickerIndex} />
         </div>
         <GifPreloader />
      </div>
   );
};
