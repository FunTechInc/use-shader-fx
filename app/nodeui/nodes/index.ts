import NoiseNode, {NoiseInitParams} from './noise';

const InitialNodes = [
   { 
      id: '2', 
      position: { x: 100, y: 0 },
      type: 'noiseNode',
      dragHandle: '.draghandle',
      data: { 
         params: {...NoiseInitParams}
      }
   },
   { 
      id: '3', 
      position: { x: 500, y: 0 },
      type: 'noiseNode',
      dragHandle: '.draghandle',
      data: { 
         params: {...NoiseInitParams}
      }
   },
];

export {
    InitialNodes,
    NoiseNode,    
};

