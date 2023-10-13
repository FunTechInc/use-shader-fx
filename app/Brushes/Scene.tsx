import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend } from "@react-three/fiber";
import { useRipple } from "./hooks/useRipple";
import { useFlowmap } from "./hooks/useFlowmap";
import { useFruid } from "./hooks/useFruid";
import { MainShaderMaterial, TMainShaderUniforms } from "./ShaderMaterial";
import { useBrush } from "./hooks/useBrush";
import { useShaderBrush } from "./hooks/useShaderBrush";
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
   // const updateBrush = useBrush(smoke);
   const updateShaderBrush = useShaderBrush();

   useFrame((props) => {
      // const texture = updateRipple(props);
      // const texture = updateFlowmap(props);
      // const texture = updateFruid(props);
      // const texture = updateBrush(props);
      const texture = updateShaderBrush(props);
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

- useFruid
	https://codepen.io/DedaloD/pen/PoJGKOb

- useCustomRipple

===============================================*/

/*===============================================
to make customhook...

- usePointer
	- beforeとenter,velocityを返すようにする
	- isVelocityUpdateのrefも返すことで停止状態を監視できるようにする
- useCamera
- useRenderTarget

===============================================*/
