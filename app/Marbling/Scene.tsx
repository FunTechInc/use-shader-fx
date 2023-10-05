import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend } from "@react-three/fiber";
import { useBrushEffect } from "./hooks/useBrushEffect";
import { useFlowmapEffect } from "./hooks/useFlowmapEffect";
import { useFruidEffect } from "./hooks/useFruidEffect";
import { MainShaderMaterial, TMainShaderUniforms } from "./ShaderMaterial";
extend({ MainShaderMaterial });

export const Scene = () => {
   const [noiseTexture, bgTexure0, bgTexure1, brush] = useLoader(
      THREE.TextureLoader,
      ["noiseTexture.jpg", "sample-2.jpg", "sample2.jpg", "brush.png"]
   );
   const mainShaderRef = useRef<TMainShaderUniforms>();
   /********************
	custom brush
	********************/
   // const updateBrush = useBrushEffect(brush);
   /********************
	flowmap
	********************/
   // const updateFlowmap = useFlowmapEffect();
   /********************
	stable fruid
	********************/
   const updateFruid = useFruidEffect();

   useFrame((props) => {
      // const texture = updateBrush(props);
      // const texture = updateFlowmap(props);
      const texture = updateFruid(props);
      const main = mainShaderRef.current;
      if (main) {
         main.u_bufferTexture = texture;
         main.u_time = props.clock.getElapsedTime();
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
            u_noiseTexture={noiseTexture}
            u_bgTexture0={bgTexure0}
            u_bgTexture1={bgTexure1}
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
