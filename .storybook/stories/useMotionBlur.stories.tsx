import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import {
   MotionBlurParams,
   MOTIONBLUR_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/effects/useMotionBlur";
import { UseMotionBlur } from "./UseMotionBlur";

const meta = {
   title: "effects/useMotionBlur",
   component: UseMotionBlur,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseMotionBlur>;

export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: MOTIONBLUR_PARAMS,
   argTypes: setArgTypes<MotionBlurParams>(MOTIONBLUR_PARAMS),
};

export const Default: Story = {
   render: (args) => <UseMotionBlur {...args} />,
   ...storySetting,
};
