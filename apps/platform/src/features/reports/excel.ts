import ExcelJS from "exceljs";
import { formatNaira } from "@sakwa/utils";

export async function transactionsWorkbook(
  rows: { occurred_on: string; direction: string; category: string; description: string; amount_kobo: number }[],
) {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet("Money");
  sheet.addRow(["Date", "Direction", "Category", "Description", "Amount"]);
  for (const row of rows) {
    sheet.addRow([
      row.occurred_on,
      row.direction,
      row.category,
      row.description,
      formatNaira(row.amount_kobo),
    ]);
  }
  return book.xlsx.writeBuffer();
}
