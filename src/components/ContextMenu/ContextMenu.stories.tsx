import type { Meta, StoryObj } from 'storybook-solidjs';
import ContextMenu, { openContextMenu } from './ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  component: ContextMenu,
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: () => (
    <div>
      <button
        onClick={(e) => {
          openContextMenu(e, [
            {
              title: 'Test1',
              onClick: () => {
                console.info('click Test1');
              },
            },
            {
              title: 'Test2',
              onClick: () => {
                console.info('click Test2');
              },
            },
          ]);
        }}
      >
        Open menu
      </button>
      <ContextMenu />
    </div>
  ),
};
