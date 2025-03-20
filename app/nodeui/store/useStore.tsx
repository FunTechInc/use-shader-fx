import { create } from 'zustand';

const useUIState = create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
}));

export default useUIState;