import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend } from "@react-three/fiber";
import { useRipple } from "./hooks/useRipple";
import { useFlowmap } from "./hooks/useFlowmap";
import { useFruid } from "./hooks/useFruid";
import { useFruid_2 } from "./hooks/useFruid_2";
import { MainShaderMaterial, TMainShaderUniforms } from "./ShaderMaterial";
import { useBrush } from "./hooks/useBrush";

extend({ MainShaderMaterial });

export const Scene = () => {
   const [bgTexure, smoke, ripple] = useLoader(THREE.TextureLoader, [
      "background.jpg",
      "smoke.png",
      "ripple.png",
   ]);
   const mainShaderRef = useRef<TMainShaderUniforms>();
   // const updateRipple = useRipple(smoke);
   // const updateFlowmap = useFlowmap();
   // const updateFruid = useFruid();
   const updateFruid_2 = useFruid_2();
   // const updateBrush = useBrush(bgTexure);

   useFrame((props) => {
      // const texture = updateRipple(props);
      // const texture = updateFlowmap(props);
      // const texture = updateFruid(props);
      const texture = updateFruid_2(props);
      // const texture = updateBrush(props);
      const main = mainShaderRef.current;
      if (main) {
         main.u_bufferTexture = texture;
      }
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <mainShaderMaterial
            key={MainShaderMaterial.key}
            ref={mainShaderRef}
            u_resolution={
               new THREE.Vector2(window.innerWidth, window.innerHeight)
            }
            u_bgTexture={bgTexure}
         />
      </mesh>
   );
};

/*===============================================
TODO:
- GUIつける GUIで操作できるようにする
- resize
- clean up

TODO*
-drei の performance monitor調べる
- Movement regressionてか、このページよく読む
https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#movement-regression
- dreiのパフォーマンス
-このページもよく読む
https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls
===============================================*/

/*===============================================
2つのbrushを共存させて複雑な絵作りの実験をあこのやつでやるか〜
fluidの上にbrush載せたら、lusionみたいな演出になりそう
===============================================*/

/*===============================================
TODO*
水面fxつくる useWatarSurface
beniのサイトは水面にまだ乾いてない絵の具で描いた絵が水面ギリギリで浮かんでるみた
いな
https://medium.com/@martinRenou/real-time-rendering-of-water-caustics-59cda1d74aa
===============================================*/

/*===============================================
TODO*
旗シェーダー（useFrag）みたいなのつくりたい〜
===============================================*/
