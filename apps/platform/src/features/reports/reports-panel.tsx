"use client";

import { Button } from "@sakwa/ui";
import { listTransactions } from "@/features/money";
import { transactionsWorkbook } from "./excel";
import { transactionsPdf } from "./pdf";

async function downloadExcel() {
  const rows = await listTransactions();
  const buffer = await transactionsWorkbook(rows);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sakwa-money.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}

async function downloadPdf() {
  const rows = await listTransactions();
  const blob = await transactionsPdf(rows);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sakwa-money.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsPanel() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={() => void downloadExcel()}>
        Download Excel
      </Button>
      <Button type="button" variant="secondary" onClick={() => void downloadPdf()}>
        Download PDF
      </Button>
    </div>
  );
}
