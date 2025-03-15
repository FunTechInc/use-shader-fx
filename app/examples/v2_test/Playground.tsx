"use client";

import * as THREE from "three";
import {
   Environment,
   MeshTransmissionMaterial,
   OrbitControls,
   useGLTF,
} from "@react-three/drei";

import { useFluid, useNoise } from "@/packages/use-shader-fx/src";

import { useCallback, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

const Model = ({ children }: { children?: React.ReactNode }) => {
   const ref = useRef<THREE.Mesh>(null);
   const { nodes, materials } = useGLTF("/ANRI_LOGO_WEB_EXPORT_V01.gltf");
   return (
      <mesh
         ref={ref}
         castShadow
         receiveShadow
         scale={10}
         geometry={nodes["OBJECTS"].children[0].geometry}>
         {children}
      </mesh>
   );
};

const Light = () => {
   return (
      <Environment
         // resolution={256}
         files={"/snowpark.exr"}
         background
         // preset="park"
         backgroundIntensity={1}
         backgroundBlurriness={0}></Environment>
   );
};

export const Playground = () => {
   const { size } = useThree();
   const fluid = useFluid({
      size,
      dpr: 0.3,
      scale: new THREE.Vector2(10, 10),
      colorBalance: {
         factor: new THREE.Vector3(1, 0, 0),
      },
      hsv: {
         saturation: 5,
      },
   });
   const materialRef = useRef<any>(null);
   useFrame((state) => {
      fluid.render(state);
      materialRef.current.userData.time.value = state.clock.getElapsedTime();
      state.camera.position.lerp(
         { x: state.pointer.x * 0.8, y: state.pointer.y * 0.8, z: 6 },
         0.05
      );
   });
   return (
      <mesh>
         <Model>
            <MeshTransmissionMaterial
               ref={materialRef}
               map={fluid.texture}
               clearcoat={0.3}
               metalness={0.6}
               roughness={0.2}
               userData={{
                  time: { value: 0 },
               }}
               onBeforeCompile={useCallback((shader: any) => {
                  Object.assign(shader.uniforms, materialRef.current.userData);
                  shader.vertexShader = shader.vertexShader.replace(
                     "#include <beginnormal_vertex>",
                     `
               			vec3 objectNormal = custom_Normal;
               			#ifdef USE_TANGENT
               			vec3 objectTangent = vec3( tangent.xyz );
               			#endif
               		`
                  );

                  shader.vertexShader = shader.vertexShader.replace(
                     "#include <begin_vertex>",
                     `
               			vec3 transformed = custom_Position;
               			#ifdef USE_ALPHAHASH
               			vPosition = vec3( position );
               			#endif
               		`
                  );

                  shader.vertexShader = shader.vertexShader.replace(
                     "void main() {",
                     `
               			uniform float time;

               			void main() {

               				vec3 custom_Position = position;
               				vec3 custom_Normal = normal;

               				custom_Position += custom_Normal * (sin(time) * .5 + .5) * 0.05;

               		`
                  );
               }, [])}
            />
         </Model>
         <OrbitControls />
         <Light />
      </mesh>
   );
};
