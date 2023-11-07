import * as React from "react";
import * as THREE from "three";
import { useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import { FxMaterial, TFxMaterial } from "../fxMaterial";
import { useDuoTone } from "../../packages/use-shader-fx/build/use-shader-fx";
import { Setup } from "../Setup";

extend({ FxMaterial });

export default {
   title: "useDuoTone",
   component: useDuoTone,
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
};

const numberArgType = {
   control: {
      max: 1,
      min: 0,
      step: 0.05,
      type: "range",
   },
};

const args = {
   test: 0.0,
};
const argTypes = {
   test: numberArgType,
};

const UseDuoToneScene = ({ args }) => {
   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);
   const fxRef = React.useRef<TFxMaterial>();
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateDuoTone] = useDuoTone({ size });

   useFrame((props) => {
      const fx = updateDuoTone(props, {
         texture: bg,
      });
      fxRef.current!.u_fx = fx;
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};

export const UseDuoToneSt = ({ ...args }) => <UseDuoToneScene args={args} />;
UseDuoToneSt.args = args;
UseDuoToneSt.argTypes = argTypes;
UseDuoToneSt.storyName = "Default";
