import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import {
   MORPHPARTICLES_PARAMS,
   MorphParticlesParams,
} from "../../packages/use-shader-fx/src/fxs/3D/useMorphParticles";
import { UseMorphParticles } from "./UseMorphParticles";

const meta = {
   title: "3D/useMorphParticles",
   component: UseMorphParticles,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseMorphParticles>;

export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: MORPHPARTICLES_PARAMS,
   argTypes: setArgTypes<MorphParticlesParams>(MORPHPARTICLES_PARAMS),
};
export const MorphParticles: Story = {
   render: (args) => <UseMorphParticles {...args} />,
   ...storySetting,
};
