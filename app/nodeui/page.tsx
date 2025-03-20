"use client";
import '@xyflow/react/dist/style.css';
import { useShallow } from 'zustand/react/shallow';
import useStore from './store';
import { ReactFlow } from '@xyflow/react';
import { NoiseNode } from './nodes';
import { WebGLTestingContainer } from '../_components/WebGL/WebGLTestingContainer';
import { useEffect } from 'react';

const nodeTypes = { noiseNode: NoiseNode };

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

   useEffect(() => {      
      console.log('compile shaderFx');
   },[nodes, edges]);
  
   return (
      <WebGLTestingContainer>      
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
   )
}
