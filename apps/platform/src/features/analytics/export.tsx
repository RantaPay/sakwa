import { formatNaira } from "@sakwa/utils";
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { AnalyticsReport, LedgerLine } from "./load";

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function analyticsCsv(report: AnalyticsReport) {
  const header = ["Date", "Books", "Direction", "What", "Who", "Detail", "Amount"];
  const rows = report.lines.map((row) =>
    [
      row.date,
      row.group === "rice" ? "House books" : row.group === "interest" ? "Investor interest" : "Cash",
      row.direction === "in" ? "In" : "Out",
      row.title,
      row.who,
      row.detail,
      formatNaira(row.amountKobo),
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.map(csvCell).join(","), ...rows].join("\n");
}

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 4 },
  summary: { marginBottom: 12, color: "#44403c" },
  row: {
    borderBottom: "1pt solid #e7e5e4",
    paddingVertical: 5,
  },
  line: { fontSize: 10 },
  muted: { fontSize: 9, color: "#57534e", marginTop: 1 },
});

function Line({ row }: { row: LedgerLine }) {
  return (
    <View style={styles.row}>
      <Text style={styles.line}>
        {row.date} · {row.title} · {row.direction === "in" ? "In" : "Out"} · {formatNaira(row.amountKobo)}
      </Text>
      <Text style={styles.muted}>
        {row.who}. {row.detail}
      </Text>
    </View>
  );
}

export async function analyticsPdf(report: AnalyticsReport) {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Sakwa books</Text>
        <Text style={styles.summary}>
          {`Expense ${formatNaira(report.expenseKobo)}. Sales ${formatNaira(report.salesKobo)}. Interest ${formatNaira(report.interestKobo)}. Cash in ${formatNaira(report.cashInKobo)}. Cash out ${formatNaira(report.cashOutKobo)}.`}
        </Text>
        {report.lines.map((row) => (
          <Line key={row.id} row={row} />
        ))}
      </Page>
    </Document>
  );
  return pdf(doc).toBlob();
}
