import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

export function EnquiryReceivedEmail({
  name,
  phone,
  email,
  intendedAmountNaira,
  message,
}: {
  name: string;
  phone: string;
  email: string;
  intendedAmountNaira?: string | null;
  message: string;
}) {
  return (
    <EmailLayout preview={`${name} sent an investor enquiry.`}>
      <Heading as="h1" style={{ fontSize: 22, color: "#4C2922" }}>
        New investor enquiry
      </Heading>
      <Text>Name: {name}</Text>
      <Text>Phone: {phone}</Text>
      <Text>Email: {email}</Text>
      {intendedAmountNaira ? <Text>Intended amount: {intendedAmountNaira}</Text> : null}
      <Text>{message}</Text>
    </EmailLayout>
  );
}
