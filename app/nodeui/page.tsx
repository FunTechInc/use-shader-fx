"use client";
import '@xyflow/react/dist/style.css';
import { useShallow } from 'zustand/react/shallow';
import useStore from './store';
import { ReactFlow } from '@xyflow/react';
import { NoiseNode, OutputNode } from './nodes';
import { WebGLTestingContainer } from '../_components/WebGL/WebGLTestingContainer';
import { useEffect } from 'react';
import { WebGLCanvas } from '../_components/WebGL/WebGLCanvas';
import { Playground } from './Playground';

const nodeTypes = { 
   noiseNode: NoiseNode,
   outputNode: OutputNode,
};

const selector = (state) => ({
   nodes: state.nodes,
   edges: state.edges,
   onNodesChange: state.onNodesChange,
   onEdgesChange: state.onEdgesChange,
   onConnect: state.onConnect,
});

export default function Page() {

   const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
      useShallow(selector),
   );

   // useEffect(() => {      
   //    console.log('compile shaderFx');
   // },[nodes, edges]);
  
   return (
      <>
         <WebGLTestingContainer
            style={{
               position: 'absolute',
               inset: 0,
               zIndex: 10,
               background: 'none'
            }}
         >
            <ReactFlow 
               nodes={nodes}
               edges={edges}
               onNodesChange={onNodesChange}
               onEdgesChange={onEdgesChange}
               nodeTypes={nodeTypes}
               fitView
               onConnect={onConnect}
            />
         </WebGLTestingContainer>   
         <WebGLTestingContainer
            style={{
               position: 'absolute',
               inset: 0,               
               zIndex: 0,               
            }}
         >
            <WebGLCanvas>
               <Playground />
            </WebGLCanvas>
         </WebGLTestingContainer>   
      </> 
   )
}
