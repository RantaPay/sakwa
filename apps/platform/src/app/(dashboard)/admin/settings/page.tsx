import { PageHeading } from "@/components/page-heading";
import { InterestSettingsForm } from "@/features/prices/interest-settings-form";
import { PriceSettingsForm } from "@/features/prices/price-settings-form";

export default function SettingsPage() {
  return (
    <div>
      <PageHeading
        mark="settings"
        title="Settings"
        body="Set the buying price, the selling price, and the weekly interest investors receive."
      />
      <PriceSettingsForm />
      <InterestSettingsForm />
    </div>
  );
}
