import * as THREE from "three";
import gsap from "gsap";

export const CONFIG = {
   /*===============================================
	post fx
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
      timeStrength: 0.23,
      distortionStrength: 0.04,
      fogEdge0: 0.43,
      fogEdge1: 0.88,
      fogColor: new THREE.Color(0xd5cea3),
      active: false,
   },
   /*===============================================
	fx
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
   simpleFruid: {
      attenuation: 1.0,
      alpha: 1.0,
      beta: 1.0,
      viscosity: 0.99,
      forceRadius: 90,
      forceCoefficient: 1.0,
   },
   selectEffect: 1,
};
