import * as THREE from "three";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "@/utils/fxMaterial";
import {
   useDomSyncer,
   useWave,
   useFxTexture,
   useCopyTexture,
} from "@/packages/use-shader-fx/src";
import { WaveParams } from "@/packages/use-shader-fx/src/fxs/effects/useWave";
import gsap from "gsap";

extend({ FxMaterial });

const CONFIG: {
   textureResolution: THREE.Vector2;
   waveArr: WaveParams[];
   waveConfig: WaveParams;
} = {
   textureResolution: new THREE.Vector2(1440, 1029),
   waveArr: [],
   waveConfig: {
      epicenter: new THREE.Vector2(0.0, 0.0),
      progress: 0.0,
      strength: 0.2,
   },
};

export const DomSyncer = ({ state }: { state: number }) => {
   useEffect(() => {
      document.documentElement.style.overflow = "auto";
   });

   const mainShaderRef = useRef<FxMaterialProps>();
   const textureRef = useRef(new THREE.Texture());

   const [momo] = useLoader(THREE.TextureLoader, ["momo.jpg"]);

   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [updateFxTexture, , fxTextureObj] = useFxTexture({ size, dpr });
   const [updateWave] = useWave({ size, dpr });

   const [updateDomSyncer, setDomSyncer, domSyncerObj] = useDomSyncer(
      { size, dpr },
      [state]
   );

   const { setFrameloop } = useThree();
   domSyncerObj.useDomView({
      onView: () => {
         console.log("play");
         setFrameloop("always");
      },
      onHidden: () => {
         console.log("stop");
         setFrameloop("never");
      },
   });

   const domArr = useRef<(HTMLElement | Element)[]>([]);
   const contentArr = useRef<HTMLElement[]>([]);

   useLayoutEffect(() => {
      CONFIG.waveArr = [];

      if (state === 0) {
         domArr.current = [...document.querySelectorAll(".item")!];
         contentArr.current = Array.from(
            document.querySelectorAll<HTMLElement>(".content")
         );
      } else {
         domArr.current = [...document.querySelectorAll(".item2")!];
         contentArr.current = Array.from(
            document.querySelectorAll<HTMLElement>(".content2")
         );
      }
      CONFIG.waveArr = [...Array(domArr.current.length)].map(() => ({
         ...CONFIG.waveConfig,
      }));

      setDomSyncer({
         dom: domArr.current,
         updateKey: performance.now(),
         boderRadius: [...Array(domArr.current.length)].map((_, i) => i * 50.0),
         rotation: [...Array(domArr.current.length)].map(
            (_, i) => new THREE.Euler(0.0, 0.0, i * 0.1)
         ),
         onIntersect: [...Array(domArr.current.length)].map(
            (_, i) => (entry) => {
               if (
                  entry.isIntersecting &&
                  !domSyncerObj.isIntersecting(i, false)
               ) {
                  gsap.fromTo(
                     CONFIG.waveArr[i],
                     {
                        progress: 0.0,
                     },
                     {
                        progress: 1.0,
                        duration: 10.0,
                     }
                  );
               }
            }
         ),
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [state]);

   const [, copyTexture] = useCopyTexture(
      { scene: fxTextureObj.scene, camera: fxTextureObj.camera, size, dpr },
      domArr.current.length
   );

   useFrame((props) => {
      const syncedTexture = updateDomSyncer(props, {
         texture: [...Array(domArr.current.length)].map((_, i) => {
            if (domSyncerObj.isIntersecting(i, false)) {
               updateFxTexture(props, {
                  padding: 0.0,
                  map: updateWave(props, {
                     epicenter: CONFIG.waveArr[i].epicenter,
                     progress: CONFIG.waveArr[i].progress,
                     strength: CONFIG.waveArr[i].strength,
                  }),
                  mapIntensity: 0.4,
                  edgeIntensity: 0.0,
                  texture0: momo,
               });

               return copyTexture(props.gl, i);
            }
            return textureRef.current;
         }),
      });

      contentArr.current.forEach((content, i) => {
         if (
            domSyncerObj.DOMRects[i] &&
            domSyncerObj.isIntersecting(i, false)
         ) {
            content.style.opacity = "1.0";
            content.style.top = `${domSyncerObj.DOMRects[i].top}px`;
            content.style.left = `${domSyncerObj.DOMRects[i].left}px`;
         }
      });

      const main = mainShaderRef.current;
      if (main) {
         main.u_fx = syncedTexture;
         main.u_alpha = 0.0;
      }
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={mainShaderRef} />
      </mesh>
   );
};
