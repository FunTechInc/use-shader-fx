export declare const useMutableState: <S>(state: S) => readonly [import("react").MutableRefObject<S>, (value: S | ((prevState: S) => S)) => void];
