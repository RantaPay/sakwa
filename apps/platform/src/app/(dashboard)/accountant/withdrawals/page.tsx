import { PageHeading } from "@/components/page-heading";
import { WithdrawalList } from "@/features/withdrawals";

export default function AccountantWithdrawalsPage() {
  return (
    <div>
      <PageHeading
        mark="profit_pay"
        title="Profit out"
        body="After the director accepts a request, pay the investor and upload the transfer receipt."
      />
      <WithdrawalList mode="pay" />
    </div>
  );
}
