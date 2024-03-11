import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import {
   WOBBLE3D_PARAMS,
   Wobble3DParams,
} from "../../packages/use-shader-fx/src/fxs/3D/useWobble3D";
import { UseWobble3D } from "./UseWobble3D";

const meta = {
   title: "3D/useWobble3D",
   component: UseWobble3D,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseWobble3D>;

export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: WOBBLE3D_PARAMS,
   argTypes: setArgTypes<Wobble3DParams>(WOBBLE3D_PARAMS),
};
export const Wobble3D: Story = {
   render: (args) => <UseWobble3D {...args} />,
   ...storySetting,
};
