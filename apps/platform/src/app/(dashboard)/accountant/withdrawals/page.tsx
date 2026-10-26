import { PageHeading } from "@/components/page-heading";
import { WithdrawalList } from "@/features/withdrawals";

export default function AccountantWithdrawalsPage() {
  return (
    <div>
      <PageHeading
        title="Profit out"
        body="Mark a request as paid only after the money has gone out offline."
      />
      <WithdrawalList mode="pay" />
    </div>
  );
}
