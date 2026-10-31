export const HOUSE_BANK = {
  house: "Sakwa Agro Enterprise",
  bank: "Guaranty Trust Bank",
  accountName: "Sakwa Agro Enterprise",
  accountNumber: "0234567891",
} as const;

export function houseAccountLines() {
  return [
    HOUSE_BANK.accountName,
    HOUSE_BANK.bank,
    HOUSE_BANK.accountNumber,
  ];
}

export function houseAccountMessage(amountLabel: string) {
  return `Pay ${amountLabel} to ${HOUSE_BANK.accountName}, ${HOUSE_BANK.bank}, ${HOUSE_BANK.accountNumber}. Then upload the receipt on your capital page. Interest starts after the director confirms that receipt.`;
}
