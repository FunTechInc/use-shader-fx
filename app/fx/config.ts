import * as THREE from "three";
import gsap from "gsap";

export const CONFIG = {
   /*===============================================
	post fx
	===============================================*/
   //transitionBg
   transitionBg: {
      texture: [new THREE.Texture()],
      noise: new THREE.Texture(),
      noiseStrength: 0.0,
      progress: 0.0,
      dir: new THREE.Vector2(0.3, 0.2),
      imageResolution: new THREE.Vector2(1440, 1440),
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
            ease: "power3.in",
         });
         tl.to(CONFIG.transitionBg, {
            noiseStrength: 0.0,
            progress: CONFIG.transitionBg.transformDir > 0 ? 0.0 : 1.0,
            ease: "power3.out",
         });
      },
   },
   //duoTone
   duoTone: {
      color0: new THREE.Color(0xffffff),
      color1: new THREE.Color(0x000000),
      active: false,
   },
   //fogProjection
   fogProjection: {
      timeStrength: 0.0,
      distortionStrength: 0.0,
      fogEdge0: 0.0,
      fogEdge1: 0.9,
      fogColor: new THREE.Color(0xffffff),
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
      velocity_acceleration: 8.0,
      pressure_dissipation: 0.9,
      pressure_iterations: 20,
      curl_strength: 4,
      splat_radius: 0.002,
      fruid_color: (velocity: THREE.Vector2) => {
         const rCol = Math.max(0.0, velocity.x * 100);
         const gCol = Math.max(0.0, velocity.y * 100);
         const bCol = (rCol + gCol) / 2;
         return new THREE.Vector3(rCol, gCol, bCol);
      },
   },
   selectEffect: -1,
};
