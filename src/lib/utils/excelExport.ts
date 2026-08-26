import * as XLSX from 'xlsx';

export interface ExcelColumn<T = any> {
  header: string;
  key: keyof T | string;
  width?: number;
  format?: (value: any, row: T) => string | number;
}

export function exportToExcel<T = any>({
  filename,
  sheetName = 'Data',
  columns,
  data,
}: {
  filename: string;
  sheetName?: string;
  columns: ExcelColumn<T>[];
  data: T[];
}) {
  if (!data || data.length === 0) {
    throw new Error('No data available to export');
  }

  // 1. Transform rows into formatted objects matching column headers
  const formattedRows = data.map((row) => {
    const formattedRow: Record<string, any> = {};
    columns.forEach((col) => {
      // Resolve value
      let rawVal: any;
      if (typeof col.key === 'string' && col.key.includes('.')) {
        // Nested path e.g. client.companyName
        rawVal = col.key.split('.').reduce((acc: any, part: string) => (acc ? acc[part] : undefined), row);
      } else {
        rawVal = (row as any)[col.key];
      }

      if (col.format) {
        formattedRow[col.header] = col.format(rawVal, row);
      } else {
        formattedRow[col.header] = rawVal ?? '—';
      }
    });
    return formattedRow;
  });

  // 2. Create Sheet
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // 3. Set auto-fit column widths
  worksheet['!cols'] = columns.map((col) => ({
    wch: col.width || Math.max(col.header.length + 4, 14),
  }));

  // 4. Create Workbook and Append Sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  // 5. Download .xlsx file in browser
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanFilename = filename.endsWith('.xlsx') ? filename : `${filename}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, cleanFilename);
}
