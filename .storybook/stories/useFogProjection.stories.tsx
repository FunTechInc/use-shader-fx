import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseFogProjection } from "./UseFogProjection";
import {
   FogProjectionParams,
   FOGPROJECTION_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useFogProjection";

const meta = {
   title: "useFogProjection",
   component: UseFogProjection,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseFogProjection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: FOGPROJECTION_PARAMS,
   argTypes: setArgTypes<FogProjectionParams>(FOGPROJECTION_PARAMS),
};
