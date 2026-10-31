import { formatNaira } from "@sakwa/utils";
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1pt solid #e7e5e4",
    paddingVertical: 6,
  },
});

export async function transactionsPdf(
  rows: {
    occurred_on: string;
    direction: string;
    category: string;
    description: string;
    amount_kobo: number;
  }[],
) {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Sakwa Agro Enterprise money list</Text>
        {rows.map((row) => (
          <View key={`${row.occurred_on}-${row.description}`} style={styles.row}>
            <Text>{row.occurred_on}</Text>
            <Text>{row.direction}</Text>
            <Text>{row.category}</Text>
            <Text>{formatNaira(row.amount_kobo)}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
  return pdf(doc).toBlob();
}
