import React from "react";
import type { Preview } from "@storybook/react";

const preview: Preview = {
   parameters: {
      layout: "fullscreen",
   },
   decorators: [
      (Story) => (
         <React.Suspense fallback={null}>
            <Story />
         </React.Suspense>
      ),
   ],
};
export default preview;
