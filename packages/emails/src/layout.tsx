import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ maxWidth: 560, padding: "32px 24px" }}>
          <Text style={{ color: "#166534", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
            SAKWA AGRO ENTERPRISE
          </Text>
          <Section>{children}</Section>
          <Text style={{ color: "#78716C", fontSize: 12, marginTop: 32 }}>
            This message was sent from the Sakwa Agro Enterprise books. Do not reply to this mail
            with payments.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
