type Utils = {
   interpolate: (
      startValue: number,
      endValue: number,
      progress: number
   ) => number;
};

export const Utils: Utils = Object.freeze({
   interpolate(startValue: number, endValue: number, progress: number): number {
      return startValue + (endValue - startValue) * progress;
   },
});
