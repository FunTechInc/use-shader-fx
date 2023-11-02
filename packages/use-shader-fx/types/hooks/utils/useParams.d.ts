type Return<T> = [T, (params: Partial<T>) => void];
export declare const useParams: <T extends object>(params: T) => Return<T>;
export {};
