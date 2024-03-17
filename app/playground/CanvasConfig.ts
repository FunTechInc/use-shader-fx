import { MorphParticlesParams } from "@/packages/use-shader-fx/src";
import gsap from "gsap";
import * as THREE from "three";

export class CanvasConfig {
   private static instance: CanvasConfig;
   public texturesPath: {
      alphaMap: string[];
      bgPoints: string[];
      points: string[];
   } = {
      alphaMap: ["/playground/alphaMap.jpg"],
      bgPoints: [
         "/playground/points/circle-grey.png",
         "/playground/points/star-grey.png",
         "/playground/points/square-grey.png",
      ],
      points: [
         "/playground/points/donut-y.png",
         "/playground/points/circle-r.png",
         "/playground/points/circles.png",
         "/playground/points/rhombus-b.png",
         "/playground/points/grid-r.png",
         "/playground/points/cell-p.png",
         "/playground/points/cell-g.png",
         "/playground/points/antenna-y.png",
         "/playground/points/cell-r.png",
         "/playground/points/cell-b.png",
         "/playground/points/grid-g.png",
         "/playground/points/square-o.png",
         "/playground/points/grid-p.png",
         "/playground/points/arrows-o.png",
         "/playground/points/donut-b.png",
      ],
   };
   public bgPointsOffset: THREE.Vector3 = new THREE.Vector3(0.4, -0.3, -0.4);
   public pointsConstantParams: MorphParticlesParams = {
      blurAlpha: 1,
      blurRadius: 1,
      pointSize: 0.12,
      sizeRandomIntensity: 1.5,
      sizeRandomTimeFrequency: 0.3,
      sizeRandomMin: 0.5,
      sizeRandomMax: 1.5,
   };
   public bgPointsConstantParams: MorphParticlesParams = {
      blurAlpha: 1,
      blurRadius: 1,
      pointSize: 0.13,
      sizeRandomIntensity: 1,
      sizeRandomTimeFrequency: 0.3,
      sizeRandomMin: 0.5,
      sizeRandomMax: 1.5,
   };

   public fxParmas: {
      morphProgress: number;
      yOffset: number;
      divergence: number;
      cameraZ: number;
   } = {
      yOffset: -10,
      morphProgress: 0.3,
      divergence: 0,
      cameraZ: 0,
   };

   private constructor() {}

   public static getInstance(): CanvasConfig {
      if (!CanvasConfig.instance) {
         CanvasConfig.instance = new CanvasConfig();
      }
      return CanvasConfig.instance;
   }

   /** オープニング */
   public openingAnimate() {
      gsap.to(this.fxParmas, {
         yOffset: -5,
         morphProgress: 0,
         divergence: 0,
         duration: 2,
         ease: "power3.out",
      });
   }

   /** スクロール連動 最初にYを0にする */
   public scrollY(y: number) {
      if (this.fxParmas.yOffset >= 0) {
         return;
      }
      // this.fxParmas.scrollY = this.fxParmas.scrollY + y;
      // 一旦サンプル
      gsap.to(this.fxParmas, {
         yOffset: 0,
         duration: 2,
         ease: "power3.out",
      });
   }
   /** 真ん中に集める */
   public gather() {
      gsap.to(this.fxParmas, {
         morphProgress: 0.8,
         divergence: -1,
         duration: 2,
         ease: "power3.out",
      });
   }
   /** 発散 */
   public diverge() {
      gsap.to(this.fxParmas, {
         divergence: 2,
         duration: 2,
         ease: "power3.out",
      });
   }
   public frameOut() {
      gsap.to(this.fxParmas, {
         cameraZ: -18,
         duration: 3,
         ease: "power2.out",
      });
   }
   public frameIn() {
      gsap.to(this.fxParmas, {
         cameraZ: 0,
         duration: 3,
         ease: "power2.out",
      });
      gsap.to(this.fxParmas, {
         divergence: -1,
         duration: 3,
         ease: "power2.inOut",
      });
   }
   public positionBottom() {
      gsap.to(this.fxParmas, {
         yOffset: -5,
         morphProgress: 0,
         divergence: 0,
         duration: 3,
         ease: "power2.out",
      });
   }
}
