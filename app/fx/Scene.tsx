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
   const [bgTexure, smoke] = useLoader(THREE.TextureLoader, [
      "background.jpg",
      "smoke.png",
   ]);
   const mainShaderRef = useRef<TMainShaderUniforms>();
   // const updateRipple = useRipple(smoke);
   // const updateFlowmap = useFlowmap();
   // const updateFruid = useFruid();
   const updateFruid_2 = useFruid_2();
   // const updateBrush = useBrush(smoke);

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
- GUIつける
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
TODO：ライブラリ化にあたあって
- resizeとかwindowSizeでやってる部分、useThreeでglのsizeもってきて、canvasのサイズに変更する
	- ライブラリでr3Fに依存できない場合、hook時点でglをうけとれるようにする
- mouse イベントにしてるとこ、useFrameのpointerから持ってくるように統一する
	- たぶんデバイス毎の正規化において、r3fに任せたほうが、対応しやすい
- pointerとかresolutuionとか、tickとか、渡す値は統一して、hook側（できればシェーダーで解決する）

===============================================*/

/*===============================================
TODO:
- useBrush
	- meshlineを使って実現する
	- めっちゃ細くしたら鉛筆、色鉛筆効果もできるみたいな
		- テクスチャーも渡せるように
- useFlowmap（あってもいいか）
- useRipple
===============================================*/

/*===============================================
to make customhook...

- usePointer
	- beforeとenter,velocityを返すようにする
	- isVelocityUpdateのrefも返すことで停止状態を監視できるようにする
- useCamera
- useRenderTarget

===============================================*/

/*===============================================
TODO
なんとしてもカールと渦巻きを出したい！！
https://portal.griflan.com/
みたいな絵にしたい
- useFruid
	https://codepen.io/DedaloD/pen/PoJGKOb
https://paveldogreat.github.io/WebGL-Fluid-Simulation/

===============================================*/

/*===============================================
2つのbrushを共存させて複雑な絵作りの実験をあこのやつでやるか〜
fluidの上にbrush載せたら、lusionみたいな演出になりそう
===============================================*/

/*===============================================
水面fxつくる
beniのサイトは水面にまだ乾いてない絵の具で描いた絵が水面ギリギリで浮かんでるみたいな
===============================================*/
