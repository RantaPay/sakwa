import { PageHeading } from "@/components/page-heading";
import { WithdrawalList } from "@/features/withdrawals";

export default function DirectorWithdrawalsPage() {
  return (
    <div>
      <PageHeading
        title="Profit requests"
        body="Approve or turn down a request. Payment is made offline."
      />
      <WithdrawalList mode="review" />
    </div>
  );
}
