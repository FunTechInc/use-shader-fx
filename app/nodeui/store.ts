import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
 
import { InitialNodes } from './nodes';
import { InitialEdges } from './edges';
import { type AppNode, type AppState } from './types';

const InitialPipeline:any[] = [];
 
const useStore = create<AppState>((set, get) => ({
  nodes: InitialNodes,
  edges: InitialEdges,
  pipeline: InitialPipeline,
  onNodesChange: (changes) => {    
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });        
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  setPipeline: (pipeline) => {
    set({pipeline});    
  },
  updateNodeParameter: (nodeId, newParams) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {          
          return { ...node, data: { ...node.data, params: newParams } };
        }                
        return node;
      })
    })        
  }
}));
 
export default useStore;