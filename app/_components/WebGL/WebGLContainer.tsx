export const WebGLContainer = ({
   style,
   ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
   return (
      <div
         style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            inset: 0,
            userSelect: "none",
            touchAction: "none",
            ...style,
         }}
         {...props}
      />
   );
};
