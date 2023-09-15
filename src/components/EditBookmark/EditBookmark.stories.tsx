import type {Meta, StoryObj} from 'storybook-solidjs';

import {EditBookmark} from './EditBookmark';

const meta: Meta<typeof EditBookmark> = {
  component: EditBookmark,
};

export default meta;
type Story = StoryObj<typeof EditBookmark>;

export const Default: Story = {
  render: () => <EditBookmark>Hello</EditBookmark>,
};
