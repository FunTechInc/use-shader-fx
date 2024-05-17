type Utils = {
   interpolate: (
      startValue: number,
      endValue: number,
      progress: number,
      threshold?: number
   ) => number;
};

export const Utils: Utils = Object.freeze({
   interpolate(startValue, endValue, progress, threshold = 1e-6): number {
      const result = startValue + (endValue - startValue) * progress;
      return Math.abs(result) < threshold ? 0 : result;
   },
});
