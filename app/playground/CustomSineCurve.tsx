import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBeat } from "@/packages/use-shader-fx/src";
import { QuadraticBezierLine } from "@react-three/drei";

export const CustomSineCurve = ({
   start,
   color,
}: {
   start: THREE.Vector3;
   color: THREE.ColorRepresentation;
}) => {
   const ref = useRef<any>();
   const getNormalizeRand = () => Math.random() * 2 - 1;
   const curveRef = useRef({
      start: start,
      mid: new THREE.Vector3(
         getNormalizeRand(),
         getNormalizeRand(),
         getNormalizeRand()
      ).add(start),
      end: new THREE.Vector3(
         getNormalizeRand(),
         getNormalizeRand(),
         getNormalizeRand()
      ).add(start),
      hash: 0,
      destination: new THREE.Vector3(0, 0, 0),
   });
   const pointerVec = useRef(new THREE.Vector2(0, 0));
   const beat = useBeat(60, "easeInOutSine");
   useFrame(({ pointer, clock }) => {
      const currentPointer = pointerVec.current
         .lerp(pointer, 0.05)
         .multiplyScalar(1);
      const { hash, fract } = beat(clock);
      if (hash !== curveRef.current.hash) {
         curveRef.current.hash = hash;
         curveRef.current.destination
            .set(getNormalizeRand(), getNormalizeRand(), getNormalizeRand())
            .add(start);
         return;
      }
      ref.current.setPoints(
         [
            curveRef.current.start.x + currentPointer.x,
            curveRef.current.start.y + currentPointer.y,
            curveRef.current.start.z,
         ],
         [
            curveRef.current.end.x - currentPointer.x,
            curveRef.current.end.y - currentPointer.y,
            curveRef.current.end.z,
         ],
         curveRef.current.mid.lerp(curveRef.current.destination, fract)
      );
   });
   return (
      <group>
         <QuadraticBezierLine
            ref={ref}
            start={curveRef.current.start}
            mid={curveRef.current.mid}
            end={curveRef.current.end}
            lineWidth={8}
            color={color}
         />
      </group>
   );
};
