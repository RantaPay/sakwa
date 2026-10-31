import { PageHeading } from "@/components/page-heading";
import { WithdrawalList } from "@/features/withdrawals";

export default function DirectorWithdrawalsPage() {
  return (
    <div>
      <PageHeading
        mark="profit_requests"
        title="Profit requests"
        body="Accept a request, pay the investor, then upload the transfer receipt. They confirm when the money lands."
      />
      <WithdrawalList mode="review" />
    </div>
  );
}
