import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

export function SimpleNoticeEmail({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <EmailLayout preview={title}>
      <Heading as="h1" style={{ fontSize: 22, color: "#18181B" }}>
        {title}
      </Heading>
      <Text>{body}</Text>
    </EmailLayout>
  );
}
