import { enquirySchema, type EnquiryInput } from "@sakwa/validators";
import { site } from "./site";

export async function submitEnquiry(input: EnquiryInput): Promise<void> {
  const parsed = enquirySchema.parse(input);
  if (parsed.website) return;

  const response = await fetch(site.enquiryEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      intendedAmountNaira: parsed.intendedAmountNaira || null,
      message: parsed.message,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "The enquiry could not be sent. Try again.");
  }
}
