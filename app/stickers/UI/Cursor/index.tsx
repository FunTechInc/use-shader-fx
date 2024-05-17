"use client";

import * as THREE from "three";
import Image from "next/image";
import { CanvasState } from "../../CanvasState";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { GifPreloader } from "./GifPreloader";
import { Confetti } from "./Confetti";
import { useIsTouchDevice } from "@funtech-inc/spice";
import s from "./index.module.scss";

const updateTargetPoint = (target: HTMLDivElement, point: THREE.Vector2) => {
   const targetRect = target.getBoundingClientRect();
   target.style.left = `${point.x - targetRect.width / 2}px`;
   target.style.top = `${point.y - targetRect.height / 2}px`;
};

const CURSOR_LERP = 0.8;

const EASING: { [key: string]: gsap.TweenVars } = {
   onStickerChange: {
      duration: 0.4,
      ease: "back.out(2)",
   },
   onConfettiView: {
      duration: 0.3,
      ease: "back.out(2)",
      stagger: {
         each: 0.03,
         from: "random",
      },
   },
   onConfettiHide: {
      duration: 0.3,
      ease: "back.in(2)",
      stagger: {
         each: 0.03,
         from: "random",
      },
   },
   onPointerOver: {
      duration: 0.4,
      ease: "back.out(2)",
   },
   onPointerOut: {
      duration: 0.4,
      ease: "back.in(2)",
   },
};

export const CursorUI = () => {
   const canvasState = CanvasState.getInstance();

   const isTouchDevice = useIsTouchDevice();

   const [stickerIndex, setStickerIndex] = useState(
      canvasState.stickerState.nextStickerIndex
   );

   const rafID = useRef<number>(0);
   const cursorRef = useRef<HTMLDivElement>(null);
   const imageRef = useRef<HTMLImageElement>(null);
   const confettiRef = useRef<HTMLDivElement>(null);
   const pointerVec = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
   const prevIsOver = useRef(false);

   useEffect(() => {
      // To avoid hydration errors, must be useEffect
      const imageTarget = imageRef.current;
      if (!imageTarget) {
         return;
      }
      imageTarget.src = `/stickers/gif/gif${stickerIndex}.gif`;
   }, [stickerIndex]);

   const onStickerChange = useCallback(
      (point: THREE.Vector2) => {
         setStickerIndex(canvasState.stickerState.nextStickerIndex);
         const imageTarget = imageRef.current;
         if (imageTarget) {
            gsap.fromTo(
               imageTarget,
               {
                  autoAlpha: 0,
                  scale: 0,
               },
               {
                  autoAlpha: 1,
                  scale: 1,
                  ...EASING.onStickerChange,
               }
            );
         }
         const confettiTarget = confettiRef.current;
         if (confettiTarget) {
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
                  ...EASING.onConfettiView,
                  onComplete: () => {
                     gsap.to(confettiImages, {
                        autoAlpha: 0,
                        scale: 0,
                        ...EASING.onConfettiHide,
                     });
                  },
               }
            );
         }
      },
      [canvasState.stickerState]
   );

   const onOver = useCallback(() => {
      const imageTarget = imageRef.current;
      if (!imageTarget) {
         return;
      }
      document.documentElement.style.cursor = "grab";
      gsap.fromTo(
         imageTarget,
         {
            autoAlpha: 0,
            scale: 0,
         },
         {
            autoAlpha: 1,
            scale: 1,
            ...EASING.onPointerOver,
         }
      );
   }, []);

   const onOut = useCallback(() => {
      const imageTarget = imageRef.current;
      if (!imageTarget) {
         return;
      }
      document.documentElement.style.cursor = "initial";
      gsap.to(imageTarget, {
         autoAlpha: 0,
         scale: 0,
         ...EASING.onPointerOut,
      });
   }, []);

   const updateCursorPoint = useCallback(
      (immediately: boolean) => {
         const target = cursorRef.current;
         if (!target) {
            return;
         }
         const point = immediately
            ? pointerVec.current.copy(canvasState.cursorState.point)
            : pointerVec.current.lerp(
                 canvasState.cursorState.point,
                 CURSOR_LERP
              );
         updateTargetPoint(target, point);
      },
      [canvasState]
   );

   const handleFrame = useCallback(() => {
      const isOver = canvasState.cursorState.isOver;

      // update sticker index
      if (stickerIndex !== canvasState.stickerState.nextStickerIndex) {
         updateCursorPoint(true);
         onStickerChange(canvasState.cursorState.point);
      }

      // onUpdate
      if (prevIsOver.current !== isOver) {
         if (isOver) {
            updateCursorPoint(true);
            onOver();
         } else {
            onOut();
         }
      }

      // loop
      if (isOver) {
         updateCursorPoint(false);
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
      updateCursorPoint,
   ]);

   useEffect(() => {
      rafID.current = requestAnimationFrame(handleFrame);
      return () => cancelAnimationFrame(rafID.current);
   }, [handleFrame]);

   return (
      <div className={s.container}>
         {!isTouchDevice && (
            <>
               <div ref={cursorRef} className={s.cursor}>
                  <Image
                     ref={imageRef}
                     src={`/stickers/gif/gif0.gif`}
                     fill
                     alt=""
                     unoptimized
                     style={{ visibility: "hidden" }}
                  />
               </div>
               <GifPreloader />
            </>
         )}
         <div ref={confettiRef} className={s.confettiContainer}>
            <Confetti state={stickerIndex} />
         </div>
      </div>
   );
};
