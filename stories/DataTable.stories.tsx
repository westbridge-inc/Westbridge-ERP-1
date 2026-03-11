import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTable, type Column, type DataTableProps } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: string;
  date: string;
}

const sampleInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-001', client: 'Acme Corp', amount: 5000, status: 'Paid', date: '2025-01-15' },
  { id: '2', invoiceNumber: 'INV-002', client: 'Globex Inc', amount: 12500, status: 'Overdue', date: '2025-01-20' },
  { id: '3', invoiceNumber: 'INV-003', client: 'Stark Industries', amount: 8750, status: 'Draft', date: '2025-02-01' },
  { id: '4', invoiceNumber: 'INV-004', client: 'Wayne Enterprises', amount: 3200, status: 'Submitted', date: '2025-02-05' },
  { id: '5', invoiceNumber: 'INV-005', client: 'Oscorp', amount: 15000, status: 'Paid', date: '2025-02-10' },
  { id: '6', invoiceNumber: 'INV-006', client: 'Umbrella Corp', amount: 6800, status: 'Unpaid', date: '2025-02-15' },
  { id: '7', invoiceNumber: 'INV-007', client: 'Cyberdyne Systems', amount: 22000, status: 'Paid', date: '2025-02-20' },
  { id: '8', invoiceNumber: 'INV-008', client: 'Initech', amount: 4500, status: 'Draft', date: '2025-03-01' },
];

const invoiceColumns: Column<Invoice>[] = [
  {
    id: 'invoiceNumber',
    header: 'Invoice',
    accessor: (row) => <span className="font-medium">{row.invoiceNumber}</span>,
    sortValue: (row) => row.invoiceNumber,
  },
  {
    id: 'client',
    header: 'Client',
    accessor: (row) => row.client,
    sortValue: (row) => row.client,
  },
  {
    id: 'amount',
    header: 'Amount',
    accessor: (row) => `$${row.amount.toLocaleString()}`,
    sortValue: (row) => row.amount,
    align: 'right',
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (row) => <Badge status={row.status}>{row.status}</Badge>,
    sortValue: (row) => row.status,
  },
  {
    id: 'date',
    header: 'Date',
    accessor: (row) => row.date,
    sortValue: (row) => row.date,
  },
];

const meta = {
  title: 'UI/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Show a skeleton loading state',
    },
    selectable: {
      control: 'boolean',
      description: 'Enable row selection with checkboxes',
    },
    pageSize: {
      control: 'number',
      description: 'Number of rows per page',
    },
    emptyTitle: {
      control: 'text',
      description: 'Title shown when there is no data',
    },
    emptyDescription: {
      control: 'text',
      description: 'Description shown when there is no data',
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<DataTableProps<Invoice>>;

export const Default: Story = {
  args: {
    columns: invoiceColumns,
    data: sampleInvoices,
    keyExtractor: (row) => row.id,
    pageSize: 20,
  },
};

export const Loading: Story = {
  args: {
    columns: invoiceColumns,
    data: [],
    keyExtractor: (row) => row.id,
    loading: true,
    pageSize: 5,
  },
};

export const Empty: Story = {
  args: {
    columns: invoiceColumns,
    data: [],
    keyExtractor: (row) => row.id,
    emptyTitle: 'No invoices found',
    emptyDescription: 'Create your first invoice to get started.',
    emptyActionLabel: 'Create Invoice',
    onEmptyAction: () => alert('Create invoice clicked'),
  },
};

export const WithPagination: Story = {
  args: {
    columns: invoiceColumns,
    data: sampleInvoices,
    keyExtractor: (row) => row.id,
    pageSize: 3,
  },
};

export const Selectable: Story = {
  render: function SelectableStory(args) {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Selected: {selectedKeys.size === 0 ? 'None' : Array.from(selectedKeys).join(', ')}
        </p>
        <DataTable
          {...args}
          columns={invoiceColumns}
          data={sampleInvoices}
          keyExtractor={(row) => row.id}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        />
      </div>
    );
  },
  args: {
    columns: invoiceColumns,
    data: sampleInvoices,
    keyExtractor: (row) => row.id,
    selectable: true,
  },
};

export const ClickableRows: Story = {
  args: {
    columns: invoiceColumns,
    data: sampleInvoices,
    keyExtractor: (row) => row.id,
    onRowClick: (row) => alert(`Clicked: ${row.invoiceNumber} - ${row.client}`),
  },
};

export const FewColumns: Story = {
  args: {
    columns: invoiceColumns.slice(0, 3),
    data: sampleInvoices,
    keyExtractor: (row) => row.id,
  },
};
