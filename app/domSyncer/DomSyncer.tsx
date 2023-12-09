import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "@/utils/fxMaterial";
import {
   useDomSyncer,
   useNoise,
   useTransitionBg,
} from "@/packages/use-shader-fx/src";

extend({ FxMaterial });

/*===============================================
TODO* 
- 角丸
===============================================*/

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
   const [updateDomSyncer] = useDomSyncer({ size, dpr }, [state]);

   const domArr = useRef<(HTMLElement | Element)[]>([]);
   useEffect(() => {
      if (state === 0) {
         domArr.current = [...document.querySelectorAll(".item")!];
      } else {
         domArr.current = [...document.querySelectorAll(".item2")!];
      }
   }, [state]);

   useFrame((props) => {
      const noise = updateNoise(props);
      const fx = updateTransitionBg(props, {
         noiseMap: noise,
         textureResolution: CONSTANT.textureResolution,
         texture0: momo,
         texture1: momo,
         noiseStrength: 0.0,
      });

      const syncedTexture = updateDomSyncer(props, {
         dom: domArr.current,
         texture: [...Array(domArr.current.length)].map(() => fx),
         resolution: [...Array(domArr.current.length)].map(
            () => CONSTANT.textureResolution
         ),
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
