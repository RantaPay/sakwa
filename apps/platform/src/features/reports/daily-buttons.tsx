"use client";

import { Button } from "@sakwa/ui";
import { useState } from "react";
import { downloadAccountantDay, downloadStoreDay } from "./daily";

export function StoreDayButton({ warehouseIds }: { warehouseIds?: string[] | null }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void downloadStoreDay(warehouseIds).finally(() => setBusy(false));
      }}
    >
      {busy ? "Preparing" : "Today's store report"}
    </Button>
  );
}

export function AccountantDayButton() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void downloadAccountantDay().finally(() => setBusy(false));
      }}
    >
      {busy ? "Preparing" : "Today's money report"}
    </Button>
  );
}
