export interface CsvColumn<T> {
  header: string;
  key: keyof T;
}

function escapeCsvCell(value: unknown): string {
  const cell = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

/** Builds an RFC 4180-ish CSV string (comma-separated, CRLF rows, quoted cells when needed). */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => escapeCsvCell(column.header)).join(',');
  const body = rows.map((row) => columns.map((column) => escapeCsvCell(row[column.key])).join(','));
  return [header, ...body].join('\r\n');
}
