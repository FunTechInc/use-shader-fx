"use client";

import * as THREE from "three";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { BufferMaterial } from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useFluid } from "@/packages/use-shader-fx/src";

extend({ BufferMaterial });

export const Playground = () => {
   const { size } = useThree();
   const [momo] = useTexture(["/momo.jpg"]);
   const material = useRef<BufferMaterial>(null);
   useEffect(() => {
      if (material.current)
         material.current.updateResolution(size.width, size.height);
   }, [size]);
   const fluid = useFluid({
      size,
      dpr: 0.25,
   });
   fluid.setValues({
      // colorBalance: {
      //    factor: new THREE.Vector3(0.5, 0, 0),
      // },
      // posterize: {
      //    levels: new THREE.Vector4(8, 8, 8, 8),
      // },
      colorBalance: false,
      posterize: false,
   });
   useFrame((state) => {
      fluid.render(state);
   });
   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <bufferMaterial
            ref={material}
            key={BufferMaterial.key}
            texture_src={momo}
            texture_fit={1}
            mixSrc={true}
            mixSrc_src={fluid.texture}
            mixSrc_uv={true}
            mixSrc_uv_factor={0.1}
            mixSrc_uv_mixMap={true}
            mixSrc_uv_mixMap_src={fluid.texture}
            posterize
            posterize_levels={new THREE.Vector4(4, 4, 4, 4)}
         />
      </mesh>
   );
};
