"use client";

import { UploadSimple } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTrigger } from "@sakwa/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthUser } from "@/lib/use-auth-user";
import { queryKeys } from "@/lib/query-keys";
import { loadCalculatorBase, saveEntries, saveLayout } from "./data";
import { SheetUpload } from "./sheet-upload";

export function HeaderUpload() {
  const client = useQueryClient();
  const { data: user } = useAuthUser();
  const query = useQuery({ queryKey: ["calculator"], queryFn: loadCalculatorBase });
  const [message, setMessage] = useState("");
  const base = query.data;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-base font-semibold text-primary-foreground"
        >
          <UploadSimple size={22} weight="light" aria-hidden />
          Upload a sheet
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <h2 className="pr-10 text-2xl font-semibold">Upload a sheet</h2>
        <p className="mt-1 text-sm text-muted">
          Column order does not matter. A total row is checked and not saved as another
          sale.
        </p>
        {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
        {!user || !base ? (
          <p className="mt-4 text-muted">Reading the stores and rates.</p>
        ) : (
          <div className="mt-4">
            <SheetUpload
              stores={base.stores}
              kgPerBag={base.kgPerBag}
              house={base.housePrices}
              storePrices={base.storePrices}
              onSave={async (rows, signature, mapping) => {
                const result = await saveEntries(rows, user.id);
                if (signature) await saveLayout(signature, mapping);
                setMessage(
                  `${result.added} rows added. ${result.skipped} already in the books.`,
                );
                await client.invalidateQueries({ queryKey: ["calculator"] });
                await client.invalidateQueries({ queryKey: queryKeys.warehouses });
                await client.invalidateQueries({ queryKey: queryKeys.systemSnapshot });
                await client.invalidateQueries({ queryKey: ["trade-books"] });
                await client.invalidateQueries({ queryKey: queryKeys.analytics });
                await client.invalidateQueries({ queryKey: queryKeys.stock });
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
