import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning'],
      description: 'The visual style of the badge',
    },
    status: {
      control: 'text',
      description: 'Auto-resolve variant from status string (Paid, Active, Submitted, Draft, Overdue, Unpaid, Error)',
    },
    children: {
      control: 'text',
      description: 'Badge content',
    },
  },
  args: {
    children: 'Badge',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'default', children: 'Default' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Destructive' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Success: Story = {
  args: { variant: 'success', children: 'Success' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Warning' },
};

// -- Status-based variants --

export const StatusPaid: Story = {
  args: { status: 'Paid', children: 'Paid' },
  name: 'Status: Paid',
};

export const StatusActive: Story = {
  args: { status: 'Active', children: 'Active' },
  name: 'Status: Active',
};

export const StatusSubmitted: Story = {
  args: { status: 'Submitted', children: 'Submitted' },
  name: 'Status: Submitted',
};

export const StatusDraft: Story = {
  args: { status: 'Draft', children: 'Draft' },
  name: 'Status: Draft',
};

export const StatusOverdue: Story = {
  args: { status: 'Overdue', children: 'Overdue' },
  name: 'Status: Overdue',
};

export const StatusUnpaid: Story = {
  args: { status: 'Unpaid', children: 'Unpaid' },
  name: 'Status: Unpaid',
};

export const StatusError: Story = {
  args: { status: 'Error', children: 'Error' },
  name: 'Status: Error',
};

// -- Gallery --

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge status="Paid">Paid</Badge>
      <Badge status="Active">Active</Badge>
      <Badge status="Submitted">Submitted</Badge>
      <Badge status="Draft">Draft</Badge>
      <Badge status="Overdue">Overdue</Badge>
      <Badge status="Unpaid">Unpaid</Badge>
      <Badge status="Error">Error</Badge>
    </div>
  ),
};
