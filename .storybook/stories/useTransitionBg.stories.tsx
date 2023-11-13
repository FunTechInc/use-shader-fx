import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseTransitionBg } from "./UseTransitionBg";
import {
   TransitionBgParams,
   TRANSITIONBG_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useTransitionBg";

const meta = {
   title: "useTransitionBg",
   component: UseTransitionBg,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseTransitionBg>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: TRANSITIONBG_PARAMS,
   argTypes: setArgTypes<TransitionBgParams>(TRANSITIONBG_PARAMS),
};
