import type { Meta, StoryObj } from 'storybook-solidjs';
import Dialog from './Dialog';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog
      title="Title"
      buttons={[
        {
          label: 'Button1',
          onClick: () => alert('ckicked'),
        },
      ]}
    >
      Content here...
    </Dialog>
  ),
};
