import * as THREE from "three";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "@/utils/fxMaterial";
import { useDomSyncer, useNoise } from "@/packages/use-shader-fx/src";

extend({ FxMaterial });

/*===============================================
TODO* 
- 角丸
- リサイズ
- resolutionの調整
===============================================*/

export const DomSyncer = ({ state }: { state: number }) => {
   const mainShaderRef = useRef<FxMaterialProps>();

   const [momo] = useLoader(THREE.TextureLoader, ["momo.jpg"]);

   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);

   const [updateNoise] = useNoise({ size, dpr });

   // TODO* dependencyを2引数に渡すようにする
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
      // TODO*ここにtextureとDOMをセットにした配列を渡す[texture, dom][]
      const tex = updateDomSyncer(props, {
         dom: domArr.current,
         texture: [...Array(domArr.current.length)].map((_, i) => noise),
      });
      const main = mainShaderRef.current;
      if (main) {
         main.u_fx = tex;
      }
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={mainShaderRef} />
      </mesh>
   );
};
