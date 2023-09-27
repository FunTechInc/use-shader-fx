import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend } from "@react-three/fiber";
import { useRippleEffect } from "./hooks/useRippleEffect";
import { useFlowmapEffect } from "./hooks/useFlowmapEffect";
import { MainShaderMaterial, TMainShaderUniforms } from "./ShaderMaterial";
extend({ MainShaderMaterial });

export const Scene = () => {
   const [noiseTexture, bgTexure0, bgTexure1, rippleBrush] = useLoader(
      THREE.TextureLoader,
      ["noiseTexture.jpg", "sample-2.jpg", "sample2.jpg", "brush.png"]
   );
   const mainShaderRef = useRef<TMainShaderUniforms>();
   // const updateRipple = useRippleEffect(rippleBrush);
   const updateFlowmap = useFlowmapEffect();

   useFrame((props) => {
      const { gl, clock } = props;
      // const texture = updateRipple(gl);
      const texture = updateFlowmap(gl);
      const tick = clock.getElapsedTime();
      const main = mainShaderRef.current;
      if (main) {
         main.u_bufferTexture = texture;
         main.u_time = tick;
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
===============================================*/

/*===============================================
TODO*
-drei の performance monitor調べる
- Movement regressionてか、このページよく読む
https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#movement-regression
- dreiのパフォーマンス
-このページもよく読む
https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls
===============================================*/
