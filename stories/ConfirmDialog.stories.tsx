import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';

const meta = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
    title: {
      control: 'text',
      description: 'Dialog title',
    },
    description: {
      control: 'text',
      description: 'Dialog description text',
    },
    confirmLabel: {
      control: 'text',
      description: 'Label for the confirm button',
    },
    cancelLabel: {
      control: 'text',
      description: 'Label for the cancel button',
    },
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Visual style of the confirm button',
    },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Confirm Dialog</Button>
        <ConfirmDialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            alert('Confirmed!');
            setOpen(false);
          }}
          title="Confirm Action"
          description="Are you sure you want to proceed with this action?"
        />
      </>
    );
  },
  args: {
    open: false,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed with this action?',
  },
};

export const DeleteConfirmation: Story = {
  render: function DeleteStory(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete Invoice
        </Button>
        <ConfirmDialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            alert('Invoice deleted!');
            setOpen(false);
          }}
          title="Delete Invoice"
          description="This will permanently delete invoice INV-001 and all associated data. This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Keep Invoice"
          variant="destructive"
        />
      </>
    );
  },
  args: {
    open: false,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Delete Invoice',
    variant: 'destructive',
  },
};

export const ArchiveConfirmation: Story = {
  render: function ArchiveStory(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Archive Client
        </Button>
        <ConfirmDialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            alert('Client archived!');
            setOpen(false);
          }}
          title="Archive Client"
          description="Archiving this client will hide them from active views. You can restore them later from the archive."
          confirmLabel="Archive"
          cancelLabel="Cancel"
          variant="default"
        />
      </>
    );
  },
  args: {
    open: false,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Archive Client',
  },
};

export const SubmitConfirmation: Story = {
  render: function SubmitStory(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Submit for Review</Button>
        <ConfirmDialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            alert('Submitted!');
            setOpen(false);
          }}
          title="Submit for Review"
          description="Once submitted, you will not be able to edit this document until the review is complete."
          confirmLabel="Submit"
          cancelLabel="Go Back"
        />
      </>
    );
  },
  args: {
    open: false,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Submit for Review',
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Delete Record',
    description: 'Are you sure you want to delete this record? This action is permanent.',
    confirmLabel: 'Delete',
    variant: 'destructive',
  },
};
