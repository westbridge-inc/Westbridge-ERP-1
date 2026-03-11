import type { Meta, StoryObj } from '@storybook/react';
import { Mail, Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show a loading spinner and disable the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as a child element using Radix Slot',
    },
  },
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
    loading: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Variants --

export const Default: Story = {
  args: { variant: 'default', children: 'Default' },
};

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Destructive' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Link' },
};

// -- Sizes --

export const Small: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const Large: Story = {
  args: { size: 'lg', children: 'Large' },
};

export const Icon: Story = {
  args: { size: 'icon', children: <Plus className="h-4 w-4" /> },
};

// -- States --

export const Loading: Story = {
  args: { loading: true, children: 'Saving...' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

// -- With Icons --

export const WithLeftIcon: Story = {
  args: {
    leftIcon: <Mail className="h-4 w-4" />,
    children: 'Send Email',
  },
};

export const DestructiveWithIcon: Story = {
  args: {
    variant: 'destructive',
    leftIcon: <Trash2 className="h-4 w-4" />,
    children: 'Delete',
  },
};

export const OutlineWithIcon: Story = {
  args: {
    variant: 'outline',
    leftIcon: <Download className="h-4 w-4" />,
    children: 'Export',
  },
};

// -- All Variants Gallery --

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon"><Plus className="h-4 w-4" /></Button>
    </div>
  ),
};
