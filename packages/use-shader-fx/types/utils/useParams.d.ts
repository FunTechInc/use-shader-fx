type UseParamsReturn<T> = [T, (params: Partial<T>) => void];
/**
 * @param params Receives an initial value object. With structuredClone, deep copy and set, but if the object contains a function, just set it.
 */
export declare const useParams: <T extends object>(params: T) => UseParamsReturn<T>;
export {};
