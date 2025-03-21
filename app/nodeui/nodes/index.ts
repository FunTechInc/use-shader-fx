import { useBuffer, useNoise } from "@/packages/use-shader-fx/src";
import NoiseNode, {NoiseInitParams} from './noise';
import OutputNode, {OutputNodeParams} from './output';

const InitialNodes = [
   { 
      id: '1', 
      position: { x: 100, y: 0 },
      type: 'noiseNode',
      dragHandle: '.draghandle',
      data: { 
         params: structuredClone(NoiseInitParams),
         fx: useNoise
      }
   },
   { 
      id: '2', 
      position: { x: 500, y: 0 },
      type: 'noiseNode',
      dragHandle: '.draghandle',
      data: { 
         params: structuredClone(NoiseInitParams),
         fx: useNoise
      }
   },
   { 
      id: '3', 
      position: { x: 900, y: 0 },
      type: 'noiseNode',
      dragHandle: '.draghandle',
      data: { 
         params: structuredClone(NoiseInitParams),
         fx: useNoise
      }
   },
   { 
      id: 'output', 
      position: { x: 1300, y: 0 },
      type: 'outputNode',
      dragHandle: '.draghandle',      
      data: { 
         params: structuredClone(OutputNodeParams),
         fx: useBuffer
      },
      deletable: false,
   },
];

export {
    InitialNodes,
    NoiseNode,
    OutputNode
};

