import type { Meta, StoryObj } from 'storybook-solidjs';
import EditBookmarkDialog from './EditBookmarkDialog';

const meta: Meta<typeof EditBookmarkDialog> = {
  component: EditBookmarkDialog,
};

export default meta;
type Story = StoryObj<typeof EditBookmarkDialog>;

export const Default: Story = {
  render: () => (
    <EditBookmarkDialog
      title="Add shortcut"
      onClose={() => {}}
      onSubmit={() => {}}
      initialValues={{
        title: 'Foo',
        url: 'Foo222',
      }}
    />
  ),
};
