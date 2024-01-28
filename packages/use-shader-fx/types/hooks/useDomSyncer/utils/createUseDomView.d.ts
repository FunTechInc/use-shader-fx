export type UseDomViewProps = {
    onView?: () => void;
    onHidden?: () => void;
};
export type UseDomView = (props: UseDomViewProps) => void;
export declare const createUseDomView: (isIntersectingRef: React.MutableRefObject<boolean[]>) => UseDomView;
