import * as THREE from "three";
import gsap from "gsap";
import GUI from "lil-gui";

export const CONFIG = {
   /*===============================================
	post fx : textureを受け取り、そのテクスチャーにfxをかけて、テクスチャーを返します
	===============================================*/
   transitionBg: {
      noiseStrength: 0.0,
      progress: 0.0,
      dir: new THREE.Vector2(0.3, 0.4),
      imageResolution: new THREE.Vector2(1440, 1029),
      active: true,
      transformDir: 1,
      transform: () => {
         CONFIG.transitionBg.transformDir =
            CONFIG.transitionBg.transformDir * -1;
         const tl = gsap.timeline({
            defaults: { duration: 2 },
         });
         tl.to(CONFIG.transitionBg, {
            noiseStrength: 0.2,
            progress: 0.5,
            ease: "power2.in",
         });
         tl.to(CONFIG.transitionBg, {
            noiseStrength: 0.0,
            progress: CONFIG.transitionBg.transformDir > 0 ? 0.0 : 1.0,
            ease: "power2.out",
         });
      },
   },
   duoTone: {
      color0: new THREE.Color(0xffffff),
      color1: new THREE.Color(0x000000),
      active: false,
   },
   fogProjection: {
      // timeStrength: 0.23,
      distortionStrength: 0.04,
      fogEdge0: 0.43,
      fogEdge1: 0.88,
      fogColor: new THREE.Color(0xd5cea3),
      active: false,
   },
   /*===============================================
	fx : 流体やrippleなど、単体で動作するfxです
	===============================================*/
   ripple: {
      frequency: 0.01,
      rotation: 0.01,
      fadeout_speed: 0.9,
      scale: 0.15,
      alpha: 0.6,
   },
   fruid: {
      density_dissipation: 0.98,
      velocity_dissipation: 0.99,
      velocity_acceleration: 10.0,
      pressure_dissipation: 0.9,
      curl_strength: 35,
      splat_radius: 0.002,
      fruidVec: new THREE.Vector3(),
      fruid_color: (velocity: THREE.Vector2) => {
         const rCol = Math.max(0.0, velocity.x * 100);
         const gCol = Math.max(0.0, velocity.y * 100);
         const bCol = (rCol + gCol) / 2;
         return CONFIG.fruid.fruidVec.set(rCol, gCol, bCol);
      },
   },
   brush: {
      radius: 0.02,
      alpha: 0.1,
      smudge: 0.0,
      dissipation: 0.98,
      magnification: 0.0,
      motionBlur: 0.0,
   },
   flowmap: {
      radius: 0.1,
      magnification: 0.0,
      alpha: 0.1,
      dissipation: 0.98,
   },
   selectEffect: 1,
};

export const setGUI = (gui: GUI) => {
   /*===============================================
	post fx
	===============================================*/
   //transitionBg
   const transitionBg = gui.addFolder("transitionBg(post)");
   transitionBg.add(CONFIG.transitionBg, "noiseStrength", 0, 1, 0.01);
   transitionBg.add(CONFIG.transitionBg, "progress", 0, 1, 0.01);
   if (CONFIG.transitionBg.dir) {
      transitionBg.add(CONFIG.transitionBg.dir, "x", 0, 1, 0.01);
      transitionBg.add(CONFIG.transitionBg.dir, "y", 0, 1, 0.01);
   }
   transitionBg.add(CONFIG.transitionBg, "transform");
   transitionBg.add(CONFIG.transitionBg, "active");

   //duo
   const duoTone = gui.addFolder("duoTone(post)");
   duoTone.addColor(CONFIG.duoTone, "color0");
   duoTone.addColor(CONFIG.duoTone, "color1");
   duoTone.add(CONFIG.duoTone, "active");

   //fog projection
   const fogProjection = gui.addFolder("fogProjection(post)");
   // fogProjection.add(CONFIG.fogProjection, "timeStrength", -10, 10, 0.01);
   fogProjection.add(CONFIG.fogProjection, "distortionStrength", 0, 10, 0.01);
   fogProjection.add(CONFIG.fogProjection, "fogEdge0", 0, 1, 0.01);
   fogProjection.add(CONFIG.fogProjection, "fogEdge1", 0, 1, 0.01);
   fogProjection.addColor(CONFIG.fogProjection, "fogColor");
   fogProjection.add(CONFIG.fogProjection, "active");

   /*===============================================
	fx
	===============================================*/

   const ripple = gui.addFolder("ripple(fx)");
   ripple.add(CONFIG.ripple, "frequency", 0, 1, 0.01);
   ripple.add(CONFIG.ripple, "rotation", 0, 1, 0.01);
   ripple.add(CONFIG.ripple, "fadeout_speed", 0, 1, 0.01);
   ripple.add(CONFIG.ripple, "scale", 0, 1, 0.01);
   ripple.add(CONFIG.ripple, "alpha", 0, 1, 0.01);

   const fruid = gui.addFolder("fruid(fx)");
   fruid.add(CONFIG.fruid, "density_dissipation", 0, 1, 0.01);
   fruid.add(CONFIG.fruid, "velocity_dissipation", 0, 1, 0.01);
   fruid.add(CONFIG.fruid, "pressure_dissipation", 0, 1, 0.01);
   fruid.add(CONFIG.fruid, "velocity_acceleration", 0, 100, 1);
   fruid.add(CONFIG.fruid, "curl_strength", 0, 100, 1);
   fruid.add(CONFIG.fruid, "splat_radius", 0, 0.1, 0.001);

   const brush = gui.addFolder("brush(fx)");
   brush.add(CONFIG.brush, "radius", 0, 0.5, 0.01);
   brush.add(CONFIG.brush, "alpha", 0, 1, 0.01);
   brush.add(CONFIG.brush, "smudge", 0, 1, 0.01);
   brush.add(CONFIG.brush, "dissipation", 0, 1, 0.01);
   brush.add(CONFIG.brush, "magnification", 0, 1, 0.01);
   brush.add(CONFIG.brush, "motionBlur", 0, 1, 0.01);

   const flowmap = gui.addFolder("flowmap(fx)");
   flowmap.add(CONFIG.flowmap, "radius", 0, 1, 0.01);
   flowmap.add(CONFIG.flowmap, "magnification", 0, 1, 0.01);
   flowmap.add(CONFIG.flowmap, "alpha", 0, 1, 0.01);
   flowmap.add(CONFIG.flowmap, "dissipation", 0, 1, 0.01);

   gui.add(CONFIG, "selectEffect", {
      ripple: 0,
      fruid: 1,
      brush: 2,
      flowmap: 3,
   });
};
