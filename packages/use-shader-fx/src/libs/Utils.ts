type Utils = {
   interpolate: (
      startValue: number,
      endValue: number,
      progress: number,
      threshold?: number
   ) => number;
   smoothstep: (edge0: number, edge1: number, x: number) => number;
};

export const Utils: Utils = Object.freeze({
   interpolate(startValue, endValue, progress, threshold = 1e-6): number {
      const t = startValue + (endValue - startValue) * progress;
      return Math.abs(t) < threshold ? 0 : t;
   },
   smoothstep(edge0, edge1, x) {
      const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
      return t * t * (3 - 2 * t);
   },
});
