"use client";

import { Button } from "@sakwa/ui";
import { PageHeading } from "@/components/page-heading";
import { listTransactions } from "@/features/transactions";
import { transactionsPdf, transactionsWorkbook } from "@/features/reports";

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

export default function ReportsPage() {
  return (
    <div>
      <PageHeading title="Reports" body="Download the money list as Excel or PDF." />
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => void downloadExcel()}>
          Download Excel
        </Button>
        <Button type="button" variant="secondary" onClick={() => void downloadPdf()}>
          Download PDF
        </Button>
      </div>
    </div>
  );
}
