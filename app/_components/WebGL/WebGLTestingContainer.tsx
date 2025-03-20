import { WebGLContainer } from "./WebGLContainer";

export const WebGLTestingContainer = ({
   style,
   children,
   ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
   return (
      <div
         style={{
            overflow: "hidden",
            backgroundImage: "url(/bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "repeat",
            height: "100svh",
            ...style,
         }}
         {...props}>
         <WebGLContainer>{children}</WebGLContainer>
      </div>
   );
};
