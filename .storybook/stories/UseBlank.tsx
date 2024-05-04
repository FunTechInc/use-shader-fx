import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { FxMaterial } from "../../utils/fxMaterial";

import { useBlank } from "../../packages/use-shader-fx/src";
import { BlankParams } from "../../packages/use-shader-fx/src/fxs/misc/useBlank";

extend({ FxMaterial });

/**
 * By default, it is a blank canvas with nothing drawn on it. You can customise the shaders using `onBeforeCompile`.
 * Fragment shaders have `uTexture`,`uBackbuffer`,`uTime`,`uPointer` and `uResolution` as default uniforms.
 *
 * ※ `usf_FragColor` overrides `gl_FragColor`
 *
 * ※ `usf_Position` overrides `gl_Position`
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const UseBlank = (args: BlankParams) => {
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });

   const [updateBlank, _, { output: blank }] = useBlank({
      size,
      dpr: dpr,
      onBeforeCompile: React.useCallback((shader: THREE.Shader) => {
         shader.fragmentShader = shader.fragmentShader.replace(
            "#usf main",
            `float t=uTime,c;vec2 z,n=vec2(cos(t),sin(t));z=vUv*2.-1.;for(int i=0;i<12;i++){if(dot(z,z)>8.)discard;z=vec2(z.x*z.x-z.y*z.y,z.x*z.y)+n;}c=cos(length(z)+log(length(z)));usf_FragColor=vec4(vec3(c),1.);`
         );
      }, []),
   });

   useFrame((props) => {
      updateBlank(props);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} u_fx={blank} u_alpha={0.0} />
      </mesh>
   );
};
