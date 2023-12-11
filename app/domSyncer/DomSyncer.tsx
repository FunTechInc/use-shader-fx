import * as THREE from "three";
import { useLayoutEffect, useRef } from "react";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "@/utils/fxMaterial";
import {
   useDomSyncer,
   useNoise,
   useTransitionBg,
} from "@/packages/use-shader-fx/src";

extend({ FxMaterial });

const CONSTANT = {
   textureResolution: new THREE.Vector2(1440, 1029),
};

export const DomSyncer = ({ state }: { state: number }) => {
   const mainShaderRef = useRef<FxMaterialProps>();

   const [momo] = useLoader(THREE.TextureLoader, ["momo.jpg"]);

   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);

   const [updateNoise] = useNoise({ size, dpr });
   const [updateTransitionBg] = useTransitionBg({ size, dpr });

   const domArr = useRef<(HTMLElement | Element)[]>([]);

   const [updateDomSyncer, setDomSyncer, domSyncerObj] = useDomSyncer(
      { size, dpr },
      [state]
   );
   useLayoutEffect(() => {
      if (state === 0) {
         domArr.current = [...document.querySelectorAll(".item")!];
      } else {
         domArr.current = [...document.querySelectorAll(".item2")!];
      }
      setDomSyncer({
         dom: domArr.current,
         boderRadius: [...Array(domArr.current.length)].map((_, i) => i * 50.0),
      });
   }, [state, setDomSyncer, momo]);

   const resolutionRef = useRef(new THREE.Vector2(0, 0));
   useFrame((props) => {
      const noise = updateNoise(props);
      const fx = updateTransitionBg(props, {
         noiseMap: noise,
         textureResolution: CONSTANT.textureResolution,
         texture0: momo,
         texture1: momo,
         noiseStrength: 0.05,
      });

      const syncedTexture = updateDomSyncer(props, {
         texture: [...Array(domArr.current.length)].map(() => fx),
         resolution: [...Array(domArr.current.length)].map(() =>
            resolutionRef.current.set(props.size.width, props.size.height)
         ),
      });

      // console.log(domSyncerObj.isIntersecting(-1, false));

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
