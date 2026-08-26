import { describe, it, expect, vi } from 'vitest';
import { exportToExcel, ExcelColumn } from '@/lib/utils/excelExport';

vi.mock('xlsx', () => {
  return {
    utils: {
      json_to_sheet: vi.fn((data) => ({ '!ref': 'A1:D3', ...data })),
      book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
      book_append_sheet: vi.fn(),
    },
    writeFile: vi.fn(),
  };
});

describe('excelExport utility', () => {
  interface TestRecord {
    id: string;
    inquiryNumber: string;
    companyName: string;
    amount: number;
    assignedTo?: { fullName: string };
  }

  const columns: ExcelColumn<TestRecord>[] = [
    { header: 'Inquiry ID', key: 'inquiryNumber', width: 15 },
    { header: 'Company Name', key: 'companyName', width: 25 },
    { header: 'Representative', key: 'assignedTo.fullName', width: 20 },
    {
      header: 'Commercial Value (INR)',
      key: 'amount',
      width: 22,
      format: (v) => `₹${Number(v).toLocaleString('en-IN')}`,
    },
  ];

  const sampleData: TestRecord[] = [
    {
      id: '1',
      inquiryNumber: '#INQ-1001',
      companyName: 'MedTech Global',
      amount: 250000,
      assignedTo: { fullName: 'Alex Mercer' },
    },
    {
      id: '2',
      inquiryNumber: '#INQ-1002',
      companyName: 'Apex Health',
      amount: 180000,
      assignedTo: { fullName: 'Elena Rostova' },
    },
  ];

  it('should format records, map nested properties, and invoke writeFile without errors', async () => {
    const XLSX = await import('xlsx');

    expect(() => {
      exportToExcel({
        filename: 'Test_Export',
        sheetName: 'Inquiries',
        columns,
        data: sampleData,
      });
    }).not.toThrow();

    expect(XLSX.writeFile).toHaveBeenCalled();
  });

  it('should throw error when data array is empty', () => {
    expect(() => {
      exportToExcel({
        filename: 'Empty_Export',
        columns,
        data: [],
      });
    }).toThrow('No data available to export');
  });
});
